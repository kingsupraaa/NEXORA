'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Project, HealthScoreBreakdown, BottleneckAnalysis } from '@/types';
import { queryDeterministicEngine, DeterministicEngineResponse, DeterministicImmediateAction } from '@/lib/ai/deterministic-engine';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  Zap, 
  ShieldAlert, 
  Clock, 
  IndianRupee, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Sliders, 
  Check, 
  AlertTriangle,
  HelpCircle,
  Cpu,
  ChevronDown,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectAIEngineProps {
  project: Project;
  health: HealthScoreBreakdown;
  bottleneck: BottleneckAnalysis;
}

interface MessageItem {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  responsePayload?: DeterministicEngineResponse;
}

export function ProjectAIEngine({ project, health, bottleneck }: ProjectAIEngineProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dispatchedActionIds, setDispatchedActionIds] = useState<Record<string, boolean>>({});
  const [dispatchingId, setDispatchingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with initial executive briefing
  useEffect(() => {
    const initialBriefing = queryDeterministicEngine(project, 'overview summary');
    setMessages([
      {
        id: 'msg-init',
        sender: 'ai',
        text: `**Deterministic Project Intelligence Engine ready for ${project.name} (${project.code}).** I analyze exact telemetry, dependency critical paths, and financial earned-value metrics without hallucination. Ask me anything or select a prompt below.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responsePayload: initialBriefing
      }
    ]);
  }, [project.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const quickPrompts = [
    { label: 'Primary Delay Cause', query: 'What is causing the primary project delay?' },
    { label: 'Budget & Overrun Risk', query: 'How bad is our budget burn and overrun risk?' },
    { label: 'Blocked Critical Tasks', query: 'Which activities are currently blocked?' },
    { label: 'Recommend Immediate Action', query: 'What immediate actions should I take right now?' },
    { label: 'Critical Risks Registry', query: 'What are the critical statutory and site risks?' }
  ];

  async function handleSend(queryText?: string) {
    const text = (queryText || inputQuery).trim();
    if (!text || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: MessageItem = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    try {
      // Deterministic engine calculation (instant, reproducible, fact-checked)
      const res = await fetch('/api/ai/project-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          question: text
        })
      });

      let data: DeterministicEngineResponse;
      if (res.ok) {
        data = await res.json();
      } else {
        // Fallback directly to client-side engine if offline
        data = queryDeterministicEngine(project, text);
      }

      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responsePayload: data
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Error querying AI engine', err);
      // Client-side fallback guarantee
      const fallbackData = queryDeterministicEngine(project, text);
      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: fallbackData.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        responsePayload: fallbackData
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  // Handle 1-click action dispatch directly to the project's task center
  async function handleDispatchAction(action: DeterministicImmediateAction) {
    setDispatchingId(action.id);
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          title: action.title,
          assignedTo: action.assignee,
          severity: action.priority === 'CRITICAL' ? 'Critical' : (action.priority === 'HIGH' ? 'High' : 'Medium'),
          departmentOrOwner: action.department,
          impact: action.impact,
          recommendedAction: action.recommendedAction,
          dueDate: action.suggestedDueDate
        })
      });

      if (res.ok) {
        setDispatchedActionIds(prev => ({ ...prev, [action.id]: true }));
      }
    } catch (err) {
      console.error('Failed to dispatch action', err);
    } finally {
      setDispatchingId(null);
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Engine Header */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-coral-600/90 text-white flex items-center justify-center shadow-lg shadow-coral-600/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>Deterministic AI Engine</span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Telemetry Engine v2.4
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Instant rule-based project question-answering with zero hallucinations and automated immediate action recommendations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-[11px] font-bold text-slate-300 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Health: {health.overallHealth}/100</span>
          </span>
          <button
            onClick={() => setMessages([messages[0]])}
            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 mr-1 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
          Quick Questions:
        </span>
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p.query)}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-xs hover:border-slate-300 transition-all whitespace-nowrap active:scale-95"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Thread Container */}
      <div className="p-5 sm:p-6 space-y-6 max-h-[550px] overflow-y-auto bg-slate-50/30">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              'flex flex-col',
              msg.sender === 'user' ? 'items-end' : 'items-start'
            )}
          >
            {/* Sender Label */}
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1 px-1">
              {msg.sender === 'user' ? (
                <>
                  <span>Project Officer</span>
                  <User className="w-3 h-3 text-slate-500" />
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5 text-coral-600" />
                  <span>Deterministic Engine</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-400 font-mono lowercase">{msg.timestamp}</span>
                </>
              )}
            </div>

            {/* Bubble */}
            <div
              className={cn(
                'rounded-2xl p-4 sm:p-5 max-w-3xl text-xs sm:text-sm leading-relaxed shadow-xs',
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none space-y-4'
              )}
            >
              {/* Direct text response */}
              <div 
                className="prose prose-xs sm:prose-sm max-w-none text-slate-800 leading-relaxed font-medium"
                dangerouslySetInnerHTML={{
                  __html: msg.text
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                }}
              />

              {/* If AI response has rich payload */}
              {msg.responsePayload && (
                <div className="space-y-4 pt-2">
                  {/* Verified Telemetry Evidence Badges */}
                  {msg.responsePayload.keyMetrics && msg.responsePayload.keyMetrics.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                      {msg.responsePayload.keyMetrics.map((km, kIdx) => (
                        <div
                          key={kIdx}
                          className={cn(
                            'p-2.5 rounded-xl border text-center flex flex-col justify-center',
                            km.status === 'danger' ? 'bg-rose-50/70 border-rose-200 text-rose-900' :
                            km.status === 'warning' ? 'bg-amber-50/70 border-amber-200 text-amber-900' :
                            'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          )}
                        >
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-0.5">
                            {km.label}
                          </span>
                          <span className="text-xs sm:text-sm font-black">
                            {km.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bullet Evidence Reasons */}
                  {msg.responsePayload.reasons && msg.responsePayload.reasons.length > 0 && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                        Deterministic Findings
                      </span>
                      {msg.responsePayload.reasons.map((r, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-coral-500 mt-1.5 shrink-0" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* RECOMMENDED IMMEDIATE ACTIONS */}
                  {msg.responsePayload.recommendedActions && msg.responsePayload.recommendedActions.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <Zap className="w-3.5 h-3.5 text-coral-600 fill-coral-600" />
                          <span>Recommended Immediate Actions ({msg.responsePayload.recommendedActions.length})</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Click to dispatch directly into Action Registry
                        </span>
                      </div>

                      <div className="space-y-3">
                        {msg.responsePayload.recommendedActions.map((action) => {
                          const isDispatched = dispatchedActionIds[action.id];
                          const isDispatching = dispatchingId === action.id;

                          return (
                            <div
                              key={action.id}
                              className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                            >
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={cn(
                                    'text-[9px] font-black uppercase px-2 py-0.5 rounded-full border',
                                    action.priority === 'CRITICAL' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                    action.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    'bg-blue-50 text-blue-700 border-blue-200'
                                  )}>
                                    {action.priority} PRIORITY
                                  </span>
                                  <span className="text-xs font-bold text-slate-900">
                                    {action.title}
                                  </span>
                                </div>

                                <p className="text-xs text-slate-600 font-medium">
                                  {action.recommendedAction}
                                </p>

                                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold pt-1">
                                  <span>Dept: <strong className="text-slate-700">{action.department}</strong></span>
                                  <span>•</span>
                                  <span>Assignee: <strong className="text-slate-700">{action.assignee}</strong></span>
                                  <span>•</span>
                                  <span>Due: <strong className="text-slate-700">{action.suggestedDueDate}</strong></span>
                                </div>
                              </div>

                              {/* Dispatch Button */}
                              <div className="shrink-0 self-end sm:self-center">
                                {isDispatched ? (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Task Dispatched</span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleDispatchAction(action)}
                                    disabled={isDispatching}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-coral-600 hover:bg-coral-700 text-white text-xs font-extrabold shadow-md shadow-coral-600/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                                  >
                                    {isDispatching ? (
                                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <Zap className="w-3.5 h-3.5" />
                                    )}
                                    <span>{isDispatching ? 'Assigning...' : 'Dispatch Action'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Deterministic Verification Rule Footer */}
                  <div className="text-[10px] font-mono text-slate-400 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="truncate max-w-md">{msg.responsePayload.logicRuleUsed}</span>
                    <span className="shrink-0 font-bold text-emerald-600">Deterministic Precision: 100%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs font-medium pl-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-coral-600" />
            <span>Calculating deterministic project telemetry & path matrices...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Ask anything about ${project.name} (e.g. "What is causing the 28-day delay?", "Who is the bottleneck owner?")...`}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-coral-500 bg-slate-50/50 focus:bg-white transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className={cn(
              'px-5 py-3 rounded-2xl text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all whitespace-nowrap',
              inputQuery.trim() && !isLoading
                ? 'bg-coral-600 hover:bg-coral-700 shadow-coral-600/25 active:scale-95'
                : 'bg-slate-300 cursor-not-allowed'
            )}
          >
            <span>Ask Engine</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
