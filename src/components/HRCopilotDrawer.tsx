import React, { useState, useRef, useEffect } from 'react';
import { Candidate, JobProfile, CopilotMessage } from '../types';
import { authenticatedFetch } from '../lib/api';
import { saveCopilotSessionToFirestore } from '../lib/firebase';
import { pcmFloat32To16BitBase64, LiveAudioPlayer } from '../lib/audioLive';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  CornerDownLeft, 
  Lightbulb, 
  FileText,
  Copy,
  Check,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  MessageSquare,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface HRCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate?: Candidate | null;
  job?: JobProfile | null;
  currentUserId?: string;
  orgId?: string;
}

export const HRCopilotDrawer: React.FC<HRCopilotDrawerProps> = ({
  isOpen,
  onClose,
  candidate,
  job,
  currentUserId = 'user_active',
  orgId = 'org_enterprise_talentintel',
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text');

  // Text Mode State
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Hello! I am **HR Copilot**. 
I have grounded context on **${candidate?.name || 'your candidates'}** evaluating against the **${job?.title || 'active requisition'}** specification.

You can ask me questions about candidates, roles, and supporting evidence — or switch to **Live Voice** for real-time natural audio conversation.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        'Why is this candidate a strong match?',
        'What evidence supports this skill?',
        'What skills are missing for this role?',
        'What potential inconsistencies should I review?',
        'What should I ask in the next interview?',
        'What happened in previous interviews?',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Live Voice Mode State
  const [voiceStatus, setVoiceStatus] = useState<'idle' | 'connecting' | 'connected' | 'speaking' | 'listening' | 'error'>('idle');
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [voiceTranscripts, setVoiceTranscripts] = useState<Array<{ sender: 'user' | 'assistant'; text: string; time: string }>>([]);
  const [voiceErrorMessage, setVoiceErrorMessage] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const audioPlayerRef = useRef<LiveAudioPlayer | null>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, voiceTranscripts, isOpen]);

  // Clean up audio and websocket on unmount or drawer close
  useEffect(() => {
    if (!isOpen) {
      stopVoiceSession();
    }
    return () => {
      stopVoiceSession();
    };
  }, [isOpen]);

  // Handle Text Mode Message Send
  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsLoading(true);

    try {
      const res = await authenticatedFetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          candidateId: candidate?.id,
          jobId: job?.id,
          history: messages.slice(-6).map(m => ({ sender: m.sender, content: m.content })),
        }),
      });

      const data = await res.json();
      if (data.message) {
        setMessages(prev => [...prev, data.message]);
        // Save session interaction to Firestore
        saveCopilotSessionToFirestore(
          orgId,
          currentUserId,
          candidate?.id,
          job?.id,
          'text',
          `Query: ${query.slice(0, 60)}...`
        );
      }
    } catch (err) {
      console.error('Copilot query failed:', err);
      const errorMsg: CopilotMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        content: 'I encountered an issue generating that analysis. Please check that the server is active.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Start Gemini Live Voice Session
  const startVoiceSession = async () => {
    setVoiceStatus('connecting');
    setVoiceErrorMessage(null);

    try {
      // 1. Initialize 24kHz Audio Player for playback
      audioPlayerRef.current = new LiveAudioPlayer();

      // 2. Open WebSocket to backend Live Voice endpoint
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-copilot-voice`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = async () => {
        console.log('[Live Voice Client]: WebSocket connected.');
        // Send candidate and job context to initialize Gemini Live session
        ws.send(JSON.stringify({
          type: 'init',
          candidate: candidate ? {
            id: candidate.id,
            name: candidate.name,
            title: candidate.title,
            overallFitScore: candidate.overallFitScore,
            skills: candidate.skills,
            experience: candidate.experience,
            claims: candidate.claims,
            certifications: candidate.certifications
          } : null,
          job: job ? {
            id: job.id,
            title: job.title,
            department: job.department,
            requiredSkills: job.requiredSkills
          } : null
        }));

        // 3. Initialize 16kHz Mic Audio Capture
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const inputCtx = new AudioContextClass({ sampleRate: 16000 });
        inputAudioCtxRef.current = inputCtx;

        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            channelCount: 1,
            sampleRate: 16000,
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        mediaStreamRef.current = stream;

        const source = inputCtx.createMediaStreamSource(stream);
        // ScriptProcessor with 4096 buffer size
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);
        audioProcessorRef.current = processor;

        source.connect(processor);
        processor.connect(inputCtx.destination);

        processor.onaudioprocess = (e) => {
          if (isMicMuted) return;
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            const base64Pcm = pcmFloat32To16BitBase64(inputData);
            ws.send(JSON.stringify({ type: 'audio', audio: base64Pcm }));
          }
        };

        setVoiceStatus('connected');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          if (msg.type === 'ready') {
            setVoiceStatus('listening');
          } else if (msg.type === 'audio' && msg.audio) {
            setVoiceStatus('speaking');
            audioPlayerRef.current?.playChunk(msg.audio);
          } else if (msg.type === 'transcript' && msg.text) {
            setVoiceTranscripts(prev => [
              ...prev,
              {
                sender: 'assistant',
                text: msg.text,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
          } else if (msg.type === 'interrupted') {
            audioPlayerRef.current?.stopAll();
            setVoiceStatus('listening');
          } else if (msg.type === 'turnComplete') {
            setVoiceStatus('listening');
          } else if (msg.type === 'error') {
            setVoiceStatus('error');
            setVoiceErrorMessage(msg.message || 'Gemini Live encountered an error.');
          }
        } catch (e) {
          console.warn('[Live Voice Msg Parse Error]:', e);
        }
      };

      ws.onerror = (err) => {
        console.error('[Live Voice WS Error]:', err);
        setVoiceStatus('error');
        setVoiceErrorMessage('WebSocket connection failed. Ensure server is active.');
      };

      ws.onclose = () => {
        console.log('[Live Voice WS Closed]');
        setVoiceStatus('idle');
      };

    } catch (err: any) {
      console.error('[Live Voice Activation Error]:', err);
      setVoiceStatus('error');
      setVoiceErrorMessage(err?.message || 'Microphone access denied or audio initialization failed.');
    }
  };

  // Stop Voice Session
  const stopVoiceSession = () => {
    if (wsRef.current) {
      try {
        wsRef.current.close();
      } catch (e) {
        // ignore
      }
      wsRef.current = null;
    }

    if (audioProcessorRef.current) {
      try {
        audioProcessorRef.current.disconnect();
      } catch (e) {}
      audioProcessorRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      try {
        inputAudioCtxRef.current.close();
      } catch (e) {}
      inputAudioCtxRef.current = null;
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.close();
      audioPlayerRef.current = null;
    }

    if (voiceStatus !== 'idle') {
      saveCopilotSessionToFirestore(
        orgId,
        currentUserId,
        candidate?.id,
        job?.id,
        'voice',
        `Live Voice Copilot Session (${voiceTranscripts.length} transcript items)`
      );
    }

    setVoiceStatus('idle');
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="copilot-drawer-panel"
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
      >
        {/* Drawer Top Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold">HR Copilot</h3>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                  Gemini Powered
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Context: <span className="text-indigo-200 font-semibold">{candidate?.name || 'Active Candidate'}</span> ({candidate?.overallFitScore ?? 85}% Role Match)
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopVoiceSession();
              onClose();
            }}
            aria-label="Close HR Copilot"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/80 p-1.5 gap-1.5">
          <button
            onClick={() => {
              if (activeTab === 'voice') stopVoiceSession();
              setActiveTab('text');
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat & Evidence Inquiry</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('voice');
              if (voiceStatus === 'idle') {
                startVoiceSession();
              }
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'voice'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
            <span>Live Voice Copilot</span>
            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-indigo-500/80 text-white">Live API</span>
          </button>
        </div>

        {/* TAB 1: TEXT MODE */}
        {activeTab === 'text' && (
          <>
            {/* Chat Messages Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
              {messages.map(msg => {
                const isUser = msg.sender === 'user';

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`p-4 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-white border border-slate-200 text-slate-800 shadow-xs rounded-tl-none'
                        }`}
                      >
                        <div className="whitespace-pre-line">{msg.content}</div>

                        {msg.citations && msg.citations.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap gap-2 text-[10px] text-slate-500">
                            {msg.citations.map((c, i) => (
                              <span key={i} className="bg-slate-100 px-2 py-0.5 rounded font-mono">
                                {c.title} • {c.snippet}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions under AI response */}
                      {!isUser && (
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 pl-1">
                          <span>{msg.timestamp}</span>
                          <span>•</span>
                          <button
                            onClick={() => handleCopyText(msg.id, msg.content)}
                            className="hover:text-slate-700 flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* Suggested Prompts Pills */}
                      {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {msg.suggestedPrompts.map((prompt, pIdx) => (
                            <button
                              key={pIdx}
                              onClick={() => handleSendMessage(prompt)}
                              className="text-[11px] bg-white hover:bg-indigo-50 text-indigo-700 font-medium px-2.5 py-1 rounded-full border border-indigo-100 shadow-2xs transition-colors cursor-pointer text-left"
                            >
                              ⚡ {prompt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mt-1 shadow-xs">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3.5 bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-xs text-xs text-slate-500 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
                    <span>Synthesizing multi-agent data & reasoning...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Bottom Input Box */}
            <div className="p-4 bg-white border-t border-slate-200">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <input
                  id="copilot-input-field"
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Ask anything about ${candidate?.name || 'candidates'} or ${job?.title || 'the job'}...`}
                  className="flex-1 text-xs border border-slate-300 rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  id="btn-send-copilot-msg"
                  type="submit"
                  disabled={isLoading || !inputMessage.trim()}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-40"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </>
        )}

        {/* TAB 2: LIVE VOICE MODE */}
        {activeTab === 'voice' && (
          <div className="flex-1 flex flex-col bg-slate-950 text-white overflow-hidden">
            {/* Live Voice Header & Status */}
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${
                  voiceStatus === 'speaking' ? 'bg-cyan-400 animate-ping' :
                  voiceStatus === 'listening' ? 'bg-emerald-400 animate-pulse' :
                  voiceStatus === 'connecting' ? 'bg-amber-400 animate-bounce' :
                  voiceStatus === 'error' ? 'bg-rose-500' : 'bg-slate-500'
                }`} />
                <div>
                  <span className="text-xs font-semibold capitalize">
                    {voiceStatus === 'speaking' && 'Copilot Speaking...'}
                    {voiceStatus === 'listening' && 'Listening (Speak freely)...'}
                    {voiceStatus === 'connecting' && 'Connecting to Gemini Live...'}
                    {voiceStatus === 'idle' && 'Session Inactive'}
                    {voiceStatus === 'error' && 'Connection Error'}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Natural conversational voice interaction via Gemini 3.1 Flash Live
                  </p>
                </div>
              </div>

              {voiceStatus !== 'idle' ? (
                <button
                  onClick={stopVoiceSession}
                  className="px-3 py-1.5 bg-rose-600/20 text-rose-300 hover:bg-rose-600/30 border border-rose-500/30 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  End Voice
                </button>
              ) : (
                <button
                  onClick={startVoiceSession}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <Radio className="w-3.5 h-3.5 text-cyan-300" />
                  Connect
                </button>
              )}
            </div>

            {/* Error Notification */}
            {voiceErrorMessage && (
              <div className="m-4 p-3 bg-rose-950/60 border border-rose-700/50 rounded-xl text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">Voice Connection Alert</p>
                  <p className="text-[11px] text-rose-300/90 mt-0.5">{voiceErrorMessage}</p>
                  <button
                    onClick={startVoiceSession}
                    className="mt-2 text-[11px] text-cyan-300 underline font-medium hover:text-cyan-200 cursor-pointer"
                  >
                    Retry Connection
                  </button>
                </div>
              </div>
            )}

            {/* Glowing Intelligence Orb Centerpiece */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-5">
              <div className="relative flex items-center justify-center">
                {/* Outer Ambient Glow Ring */}
                <div className={`w-36 h-36 rounded-full absolute filter blur-xl transition-all duration-700 ${
                  voiceStatus === 'speaking' ? 'bg-cyan-500/40 scale-125' :
                  voiceStatus === 'listening' ? 'bg-emerald-500/30 scale-110' :
                  voiceStatus === 'connecting' ? 'bg-amber-500/30 scale-105' : 'bg-indigo-500/20 scale-95'
                }`} />

                {/* Pulsating Animated Orb */}
                <div className={`w-28 h-28 rounded-full border border-white/20 shadow-2xl flex items-center justify-center transition-all duration-500 ${
                  voiceStatus === 'speaking' ? 'bg-gradient-to-tr from-cyan-600 via-indigo-600 to-blue-500 animate-pulse scale-110 ring-8 ring-cyan-400/20' :
                  voiceStatus === 'listening' ? 'bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-700 scale-105 ring-8 ring-emerald-400/20' :
                  voiceStatus === 'connecting' ? 'bg-gradient-to-tr from-amber-600 via-indigo-700 to-slate-800 animate-spin ring-4 ring-amber-400/20' :
                  'bg-gradient-to-tr from-slate-800 to-indigo-950 ring-2 ring-slate-700'
                }`}>
                  {voiceStatus === 'speaking' ? (
                    <Volume2 className="w-10 h-10 text-white animate-bounce" />
                  ) : voiceStatus === 'listening' ? (
                    <Mic className="w-10 h-10 text-emerald-200 animate-pulse" />
                  ) : voiceStatus === 'connecting' ? (
                    <RefreshCw className="w-8 h-8 text-amber-200 animate-spin" />
                  ) : (
                    <MicOff className="w-8 h-8 text-slate-400" />
                  )}
                </div>
              </div>

              <div className="space-y-1 max-w-sm">
                <h4 className="text-sm font-semibold text-white">
                  {voiceStatus === 'speaking' && 'Copilot is providing grounded audio analysis...'}
                  {voiceStatus === 'listening' && 'Listening... Ask your question aloud'}
                  {voiceStatus === 'connecting' && 'Establishing low-latency live audio pipeline...'}
                  {voiceStatus === 'idle' && 'Live Voice Ready'}
                </h4>
                <p className="text-xs text-slate-400">
                  {voiceStatus === 'listening'
                    ? 'Speak naturally at any time. You can also interrupt the AI whenever you wish.'
                    : `Active candidate: ${candidate?.name || 'Evaluated Candidate'}`}
                </p>
              </div>

              {/* Spoken Prompts Ideas */}
              <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-left space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Try asking aloud:</span>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <p className="italic">"What are the top 3 strengths of {candidate?.name || 'this candidate'} for the {job?.title || 'role'}?"</p>
                  <p className="italic">"Are there any discrepancies in the reported employment dates?"</p>
                  <p className="italic">"Suggest 2 rigorous technical questions for the next interview round."</p>
                </div>
              </div>
            </div>

            {/* Voice Control Bar */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsMicMuted(prev => !prev)}
                  disabled={voiceStatus === 'idle' || voiceStatus === 'connecting'}
                  className={`p-3 rounded-full transition-colors cursor-pointer ${
                    isMicMuted 
                      ? 'bg-rose-600 text-white hover:bg-rose-700' 
                      : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'
                  }`}
                  title={isMicMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                >
                  {isMicMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5 text-cyan-300" />}
                </button>
                <span className="text-xs text-slate-400">
                  {isMicMuted ? 'Microphone Muted' : 'Mic Active'}
                </span>
              </div>

              <div className="text-[11px] text-slate-500">
                16kHz capture • 24kHz stream
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
