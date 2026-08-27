import React, { useState, useRef, useEffect } from 'react';
import { Candidate, JobProfile, CopilotMessage } from '../types';
import { authenticatedFetch } from '../lib/api';
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
  Check
} from 'lucide-react';

interface HRCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate?: Candidate | null;
  job?: JobProfile | null;
}

export const HRCopilotDrawer: React.FC<HRCopilotDrawerProps> = ({
  isOpen,
  onClose,
  candidate,
  job,
}) => {
  const candidateName = candidate?.name || 'the active candidate';
  const jobTitle = job?.title || 'the target requisition';

  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content: `Hello! I am your **TalentIntel AI Decision Copilot**. 
I have grounded context on **${candidate?.name || 'your candidates'}** evaluating against the **${job?.title || 'active requisition'}** specification.

You can ask me to:
- Draft personalized offer letters and compensation negotiation anchors.
- Probe specific resume claims or detect anomalies.
- Simulate rigorous technical panel questions.
- Generate executive trade-off summaries for hiring committee review.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        'Draft personalized offer pitch',
        'Check salary vs market benchmark',
        'Generate 3 probing interview questions',
        'Explain role fit trade-offs',
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

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

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="copilot-drawer-panel"
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200"
      >
        {/* Drawer Top Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h3 className="text-sm font-bold">TalentIntel AI Copilot</h3>
              <p className="text-[11px] text-slate-400">
                Context: <span className="text-indigo-200 font-semibold">{candidate?.name || 'Active Candidate'}</span> ({candidate?.overallFitScore ?? 85}% Fit)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
      </div>
    </div>
  );
};
