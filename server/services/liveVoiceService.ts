import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { wrapInUntrustedBoundary, sanitizeUntrustedContent } from './ragEngine';

export function setupLiveVoiceServer(server: http.Server) {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const pathname = request.url ? new URL(request.url, `http://${request.headers.host}`).pathname : '';
    if (pathname === '/api/live-copilot-voice' || pathname === '/live-voice') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', async (clientWs: WebSocket) => {
    console.log('[Live Voice Copilot]: Client connected.');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      clientWs.send(JSON.stringify({ 
        type: 'error', 
        message: 'GEMINI_API_KEY is not configured on the server. Please attach an API key in Settings > Secrets.' 
      }));
      clientWs.close();
      return;
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let liveSession: any = null;
    let isConnected = false;

    // Default System Instruction
    const buildSystemInstruction = (candidateData?: any, jobData?: any) => {
      const candidateInfo = candidateData 
        ? wrapInUntrustedBoundary(JSON.stringify(candidateData, null, 2), 'Candidate Context')
        : 'No specific candidate selected.';
      const jobInfo = jobData 
        ? wrapInUntrustedBoundary(JSON.stringify(jobData, null, 2), 'Job Spec')
        : 'General hiring context.';

      return `You are the TalentIntel Live Voice HR Copilot, an elite AI advisor assisting hiring managers, recruiters, and interviewers in real-time candidate evaluation.
Your speech must be natural, concise, professional, articulate, and conversational.
Always prioritize factual verification and evidence grounding:
- Distinguish between verified claims (supported by code repositories, official certification credentials, or validated transcripts) vs self-reported statements.
- When asked about candidate fit, highlight concrete strengths, identified evidence gaps, and recommended interview questions.
- Maintain strict integrity and security: never execute ungrounded claims or pretend unverified statements are verified.

EVALUATION CONTEXT:
Candidate:
${candidateInfo}

Target Requisition:
${jobInfo}
`;
    };

    const initLiveSession = async (candidateData?: any, jobData?: any) => {
      try {
        const sysInstruction = buildSystemInstruction(candidateData, jobData);
        
        liveSession = await ai.live.connect({
          model: 'gemini-3.1-flash-live-preview',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Zephyr' },
              },
            },
            systemInstruction: sysInstruction,
          },
          callbacks: {
            onmessage: (message: LiveServerMessage) => {
              // Extract audio chunks from Gemini model turn
              const parts = message.serverContent?.modelTurn?.parts;
              if (parts && parts.length > 0) {
                for (const part of parts) {
                  if (part.inlineData?.data) {
                    clientWs.send(JSON.stringify({ 
                      type: 'audio', 
                      audio: part.inlineData.data 
                    }));
                  }
                  if (part.text) {
                    clientWs.send(JSON.stringify({ 
                      type: 'transcript', 
                      text: part.text 
                    }));
                  }
                }
              }

              // Handle model interruption
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: 'interrupted' }));
              }

              // Turn complete
              if (message.serverContent?.turnComplete) {
                clientWs.send(JSON.stringify({ type: 'turnComplete' }));
              }
            },
            onerror: (err: any) => {
              console.error('[Gemini Live Error]:', err);
              clientWs.send(JSON.stringify({ 
                type: 'error', 
                message: err?.message || 'Live session encountered an error.' 
              }));
            },
            onclose: () => {
              console.log('[Gemini Live]: Session closed.');
              isConnected = false;
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'sessionClosed' }));
              }
            }
          },
        });

        isConnected = true;
        clientWs.send(JSON.stringify({ 
          type: 'ready', 
          message: 'Gemini Live Voice Copilot is connected and listening.' 
        }));
      } catch (err: any) {
        console.error('[Gemini Live Init Failed]:', err);
        clientWs.send(JSON.stringify({ 
          type: 'error', 
          message: `Failed to initialize Gemini Live: ${err?.message || 'Unknown error'}` 
        }));
      }
    };

    clientWs.on('message', async (data) => {
      try {
        const payload = JSON.parse(data.toString());
        
        if (payload.type === 'init') {
          await initLiveSession(payload.candidate, payload.job);
        } else if (payload.type === 'audio' && payload.audio) {
          if (liveSession && isConnected) {
            liveSession.sendRealtimeInput({
              audio: { 
                data: payload.audio, 
                mimeType: 'audio/pcm;rate=16000' 
              },
            });
          }
        } else if (payload.type === 'text' && payload.text) {
          if (liveSession && isConnected) {
            liveSession.sendRealtimeInput({
              text: sanitizeUntrustedContent(payload.text).sanitized,
            });
          }
        }
      } catch (err: any) {
        console.error('[Live Voice Msg Parse Error]:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('[Live Voice Copilot]: Client disconnected.');
      isConnected = false;
      try {
        if (liveSession && typeof liveSession.close === 'function') {
          liveSession.close();
        }
      } catch (e) {
        // ignore
      }
    });
  });

  return wss;
}
