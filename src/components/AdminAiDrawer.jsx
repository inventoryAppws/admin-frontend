import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  X,
  Send,
  ExternalLink,
  Shield,
  Activity,
  AlertTriangle,
  Package,
  TrendingUp,
  FileText,
  DollarSign,
  Mic,
  MicOff,
  History,
  Settings,
  Plus,
  Bot,
  Users,
  ChevronDown,
  Check,
  Zap,
  Search
} from 'lucide-react';
import {
  chatWithTitan,
  getAdminAiSuggestions,
  getTitanConversation,
  createTitanConversation
} from '../services/adminAiService';
import AdminAiHistory from './AdminAiHistory';
import AdminAiSettings from './AdminAiSettings';
import AdminAiAgentPicker, { TITAN_MODELS } from './AdminAiAgentPicker';
import AdminAiWelcome from './AdminAiWelcome';
import { getAdminPageContext } from '../utils/adminPageContext';
import { toast } from './Toast';
import '../admin-ai.css';

function formatInlineMarkdown(str) {
  if (!str) return '';
  const parts = [];
  let remaining = str;
  let key = 0;

  while (remaining) {
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const italicMatch = remaining.match(/\*([^*]+?)\*/);

    const matches = [
      boldMatch ? { type: 'bold', index: boldMatch.index, length: boldMatch[0].length, text: boldMatch[1] } : null,
      codeMatch ? { type: 'code', index: codeMatch.index, length: codeMatch[0].length, text: codeMatch[1] } : null,
      italicMatch ? { type: 'italic', index: italicMatch.index, length: italicMatch[0].length, text: italicMatch[1] } : null
    ].filter(Boolean).sort((a, b) => a.index - b.index);

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0];
    if (first.index > 0) {
      parts.push(remaining.slice(0, first.index));
    }

    if (first.type === 'bold') {
      parts.push(<strong key={key++}>{first.text}</strong>);
    } else if (first.type === 'code') {
      parts.push(
        <code key={key++} className="titan-ai-inline-code">
          {first.text}
        </code>
      );
    } else if (first.type === 'italic') {
      parts.push(<em key={key++}>{first.text}</em>);
    }

    remaining = remaining.slice(first.index + first.length);
  }

  return parts;
}

function FormattedTitanMessage({ text }) {
  if (!text) return null;
  const lines = text.split('\n');
  const elements = [];
  let inTable = false;
  let tableRows = [];
  let inList = false;
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="titan-ai-rendered-list">
          {listItems.map((li, idx) => (
            <li key={idx}>{formatInlineMarkdown(li)}</li>
          ))}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = () => {
    if (tableRows.length > 0) {
      const [headerRow, , ...bodyRows] = tableRows;
      const headers = headerRow ? headerRow.split('|').filter((s) => s.trim().length > 0) : [];
      elements.push(
        <div key={`table-wrap-${elements.length}`} className="titan-ai-table-responsive">
          <table className="titan-ai-rendered-table">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th key={i}>{formatInlineMarkdown(h.trim())}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((r, rIdx) => {
                const cells = r.split('|').filter((s) => s.trim().length > 0);
                return (
                  <tr key={rIdx}>
                    {cells.map((c, cIdx) => (
                      <td key={cIdx}>{formatInlineMarkdown(c.trim())}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      inTable = true;
      if (!trimmed.includes('---')) {
        tableRows.push(trimmed);
      }
      return;
    } else if (inTable) {
      flushTable();
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.slice(2));
      return;
    } else if (inList) {
      flushList();
    }

    if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={elements.length}>{formatInlineMarkdown(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith('#### ')) {
      elements.push(<h4 key={elements.length}>{formatInlineMarkdown(trimmed.slice(5))}</h4>);
    } else if (trimmed.length > 0) {
      elements.push(<p key={elements.length}>{formatInlineMarkdown(trimmed)}</p>);
    }
  });

  flushList();
  flushTable();

  return <>{elements}</>;
}

export default function AdminAiDrawer({ isOpen, onClose, initialQuery = '' }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeModel, setActiveModel] = useState(
    () => localStorage.getItem('titan_ai_provider') || 'auto'
  );
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [subView, setSubView] = useState('chat'); // 'chat' | 'history' | 'settings' | 'agents'
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const pageContext = getAdminPageContext(window.location.pathname);
  const [quickPrompts, setQuickPrompts] = useState([
    'Platform Overview',
    'Vendors with >20% Drop',
    'Inventory Risk',
    'Anomaly Detection',
    'Payment & Refunds',
    'Executive BI Report'
  ]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const messagesRef = useRef(messages);
  const sentInitialQueryRef = useRef(null);

  messagesRef.current = messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && subView === 'chat') {
      scrollToBottom();
      setTimeout(() => textareaRef.current?.focus(), 150);
    }
  }, [messages, isOpen, subView]);

  // Load backend suggestions
  useEffect(() => {
    getAdminAiSuggestions()
      .then((data) => {
        if (Array.isArray(data?.suggestions) && data.suggestions.length > 0) {
          setQuickPrompts(data.suggestions);
        }
      })
      .catch(() => {});
  }, []);

  // Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.info('Could not capture voice. Please type your query.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      setVoiceSupported(true);
    } else {
      setVoiceSupported(false);
    }
  }, []);

  const toggleVoice = () => {
    if (!voiceSupported) {
      toast.info("Voice dictation is not supported in this browser.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        toast.info('Listening... Speak your audit question.');
      } catch (err) {
        console.warn('Could not start microphone:', err);
      }
    }
  };

  const inputValueRef = useRef(inputValue);
  inputValueRef.current = inputValue;

  const handleSend = useCallback(
    async (queryText) => {
      const textToSend = String((queryText !== undefined && queryText !== null) ? queryText : (inputValueRef.current || '')).trim();
      if (!textToSend || loading) return;

      setInputValue('');
      inputValueRef.current = '';
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
      }

      const userMsg = { sender: 'user', text: textToSend };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const history = (messagesRef.current || []).map((m) => ({
          role: m.sender === 'titan' ? 'assistant' : 'user',
          content: m.text
        }));

        const currentProvider = activeModel || localStorage.getItem('titan_ai_provider') || 'auto';
        const pageCtx = getAdminPageContext(window.location.pathname);

        const res = await chatWithTitan({
          message: textToSend,
          conversationHistory: history,
          conversationId: activeConversationId,
          agentMode: currentProvider,
          aiProviderPreference: currentProvider,
          pageContext: {
            path: window.location.pathname,
            title: pageCtx?.pageTitle,
            key: pageCtx?.pageKey
          }
        });

        if (res.conversationId && !activeConversationId) {
          setActiveConversationId(res.conversationId);
        }

        // AUTO FALLBACK MODEL SWITCHING (Darwin Concept)
        // If the backend resolved the query using a fallback engine (e.g. Groq, Cerebras, NLP)
        // or resolved the query under Auto Router, update the activeModel state and pill!
        if (res?.mode) {
          const matchedModel = TITAN_MODELS.find((m) => m.id === res.mode);
          if (matchedModel && activeModel !== res.mode) {
            setActiveModel(res.mode);
            localStorage.setItem('titan_ai_provider', res.mode);
            if (activeModel !== 'auto') {
              toast.info(`Fell back to ${matchedModel.name}`);
            }
          }
        }

        if (res?.action) {
          if (res.action.type === 'profile_updated') {
            try {
              const current = JSON.parse(localStorage.getItem('admin_user') || '{}');
              const updated = { ...current, name: res.action.name || res.action.admin?.name || current.name };
              localStorage.setItem('admin_user', JSON.stringify(updated));
              window.dispatchEvent(new Event('admin_user_updated'));
            } catch (err) {}
            toast.success(res.action.message || 'Admin profile updated successfully!');
          } else if (res.action.type === 'settings_updated') {
            if (res.action.settings?.aiProviderPreference) {
              const newPref = res.action.settings.aiProviderPreference;
              setActiveModel(newPref);
              localStorage.setItem('titan_ai_provider', newPref);
            }
            toast.success(res.action.message || 'Titan settings updated successfully!');
          } else if (res.action.type === 'open_settings') {
            setSubView('settings');
          } else if (res.action.type === 'vendor_status_updated') {
            toast.success(res.action.message || 'Vendor status updated!');
          } else if (res.action.type === 'store_settings_updated') {
            window.dispatchEvent(new CustomEvent('store_settings_updated', { detail: res.action.settings }));
            toast.success(res.action.message || 'Store settings updated successfully!');
          } else if (res.action.type === 'payout_processed') {
            window.dispatchEvent(new CustomEvent('vendor_payout_processed', { detail: res.action }));
            toast.success(res.action.message || 'Vendor payout processed successfully!');
          } else if (res.action.type === 'notification_sent') {
            window.dispatchEvent(new CustomEvent('notification_broadcast_sent', { detail: res.action }));
            toast.success(res.action.message || 'Notification broadcast dispatched!');
          } else if (res.action.type === 'report_triggered') {
            toast.success(res.action.message || 'Scheduled executive report dispatched!');
          }
        }

        const titanMsg = {
          sender: 'titan',
          text: res?.message || 'Platform intelligence processed.',
          actions: res?.actions || [],
          suggestions: res?.suggestions || []
        };

        setMessages((prev) => [...prev, titanMsg]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            sender: 'titan',
            text: 'The Platform Intelligence service is temporarily unavailable. Please verify connection and retry.',
            suggestions: ['Platform Overview', 'Vendors with >20% sales drop']
          }
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, activeConversationId, activeModel, isListening, inputValue]
  );

  // Initial query trigger (executes exactly once per query when opened)
  useEffect(() => {
    if (isOpen && initialQuery && initialQuery.trim() && sentInitialQueryRef.current !== initialQuery) {
      sentInitialQueryRef.current = initialQuery;
      handleSend(initialQuery);
    }
    if (!isOpen) {
      sentInitialQueryRef.current = null;
    }
  }, [isOpen, initialQuery, handleSend]);

  const handleStartNewChat = async () => {
    try {
      const newConv = await createTitanConversation('New Platform Audit', activeModel);
      setActiveConversationId(newConv._id);
    } catch {
      setActiveConversationId(null);
    }
    setMessages([]);
    setSubView('chat');
    toast.success('Started a fresh platform audit session');
  };

  const handleSelectConversation = async (convId) => {
    setLoading(true);
    try {
      const conv = await getTitanConversation(convId);
      if (conv) {
        setActiveConversationId(conv._id);
        if (conv.agentMode) setActiveModel(conv.agentMode);
        const mapped = (conv.messages || []).map((m) => ({
          sender: m.role === 'user' ? 'user' : 'titan',
          text: m.content,
          actions: m.structuredData?.actions || [],
          suggestions: m.structuredData?.suggestions || []
        }));
        setMessages(
          mapped.length > 0
            ? mapped
            : []
        );
      }
    } catch (err) {
      toast.error('Could not load audit history.');
    } finally {
      setLoading(false);
      setSubView('chat');
    }
  };

  const currentModel =
    TITAN_MODELS.find((a) => a.id === activeModel) || TITAN_MODELS[0];

  if (!isOpen) return null;

  return (
    <div className="titan-ai-modal-backdrop" onClick={onClose}>
      <div
        className="titan-ai-wide-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Titan AI Platform Intelligence"
      >
        {/* MODAL HEADER */}
        <div className="titan-ai-modal-header">
          <div className="titan-ai-header-left">
            <div className="titan-ai-avatar">
              <img
                src="/titan-mascot.png"
                alt="Titan AI"
                className="titan-ai-avatar-img"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <span className="titan-ai-status-dot" />
            </div>

            <div className="titan-ai-title-wrap">
              <div className="titan-ai-title-row">
                <h3>Titan AI</h3>
                {/* Active Agent Model Badge with quick Switch click */}
                <button
                  type="button"
                  className="titan-ai-agent-badge clickable"
                  onClick={() => setSubView(subView === 'agents' ? 'chat' : 'agents')}
                  title="Click to switch AI Engine & Model"
                >
                  <span className="titan-ai-mode-dot" style={{ background: currentModel.color }} />
                  <span className="titan-ai-badge-text">{currentModel.name}</span>
                  <ChevronDown size={11} className="titan-ai-chevron" />
                </button>
              </div>
              <p>Platform Operations, Risk Audits &amp; Executive Intelligence</p>
            </div>
          </div>

          {/* TOP CONTROLS (History, Settings, New Chat, Switch Agents, Close) */}
          <div className="titan-ai-header-controls">
            <button
              type="button"
              className={`titan-ai-control-btn ${subView === 'history' ? 'active' : ''}`}
              title="Audit History"
              onClick={() => setSubView(subView === 'history' ? 'chat' : 'history')}
            >
              <History size={17} />
              <span className="btn-label">History</span>
            </button>

            <button
              type="button"
              className={`titan-ai-control-btn ${subView === 'settings' ? 'active' : ''}`}
              title="Settings"
              onClick={() => setSubView(subView === 'settings' ? 'chat' : 'settings')}
            >
              <Settings size={17} />
              <span className="btn-label">Settings</span>
            </button>

            <button
              type="button"
              className={`titan-ai-control-btn ${subView === 'agents' ? 'active' : ''}`}
              title="Switch AI Engine & Model"
              onClick={() => setSubView(subView === 'agents' ? 'chat' : 'agents')}
            >
              <Users size={17} />
              <span className="btn-label">Models</span>
            </button>

            <button
              type="button"
              className="titan-ai-control-btn new-chat"
              title="Start New Audit"
              onClick={handleStartNewChat}
            >
              <Plus size={17} />
              <span className="btn-label">New Audit</span>
            </button>

            <button
              type="button"
              className="titan-ai-close-btn"
              onClick={onClose}
              aria-label="Close Titan Modal"
            >
              <X size={19} />
            </button>
          </div>
        </div>

        {/* SUBVIEWS */}
        {subView === 'history' && (
          <AdminAiHistory
            onSelectConversation={handleSelectConversation}
            onStartNewChat={handleStartNewChat}
            onBack={() => setSubView('chat')}
            activeConversationId={activeConversationId}
            currentAgentMode={activeModel}
          />
        )}

        {subView === 'settings' && (
          <AdminAiSettings
            onBack={() => setSubView('chat')}
            onProviderChange={(p) => {
              toast.info(`Switched AI provider to ${p}`);
            }}
          />
        )}

        {subView === 'agents' && (
          <AdminAiAgentPicker
            activeAgentId={activeModel}
            onSelectAgent={(modelId) => {
              setActiveModel(modelId);
              localStorage.setItem('titan_ai_provider', modelId);
              const model = TITAN_MODELS.find((m) => m.id === modelId);
              toast.success(`Switched AI Engine to ${model?.name || modelId}`);
              setSubView('chat');
            }}
            onBack={() => setSubView('chat')}
          />
        )}

        {/* MAIN CHAT VIEW (Spacious Wide Layout) */}
        {subView === 'chat' && (
          <>
            {/* MODEL BANNER & QUICK PROMPTS CHIPS BAR */}
            <div className="titan-ai-agent-banner">
              <div className="titan-ai-banner-agent-info">
                <span className="banner-agent-title">AI Engine:</span>
                <span className="banner-agent-name">{currentModel.name}</span>
                <span className="banner-agent-desc">— {currentModel.flow}</span>
              </div>

              <div className="titan-ai-prompts-bar">
                {(pageContext?.quickChips || quickPrompts).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="titan-ai-prompt-chip"
                    onClick={() => handleSend(p)}
                    disabled={loading}
                  >
                    <Sparkles size={12} style={{ color: currentModel.color }} />
                    <span>{p}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* MESSAGES LIST */}
            <div className="titan-ai-messages">
              {messages.length === 0 && (
                <AdminAiWelcome onSelectPrompt={(q) => handleSend(q)} />
              )}
              {messages.map((m, idx) => (
                <div key={idx} className={`titan-ai-message ${m.sender}`}>
                  <div className="titan-msg-avatar">
                    {m.sender === 'titan' ? (
                      <img
                        src="/titan-mascot.png"
                        alt="Titan"
                        className="titan-msg-avatar-img"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      'Admin'
                    )}
                  </div>
                  <div className="titan-msg-bubble">
                    <FormattedTitanMessage text={m.text} />

                    {/* Quick Action Navigation Links */}
                    {Array.isArray(m.actions) && m.actions.length > 0 && (
                      <div className="titan-ai-actions">
                        {m.actions.map((act, aIdx) => (
                          <a
                            key={aIdx}
                            href={act.url}
                            className="titan-ai-action-btn"
                            onClick={onClose}
                          >
                            <ExternalLink size={13} />
                            <span>{act.label}</span>
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Contextual Suggestion Pills */}
                    {Array.isArray(m.suggestions) && m.suggestions.length > 0 && (
                      <div className="titan-ai-msg-suggestions">
                        {m.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            className="titan-ai-sub-chip"
                            onClick={() => handleSend(sug)}
                            disabled={loading}
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="titan-ai-message titan">
                  <div className="titan-msg-avatar">
                    <Sparkles size={16} />
                  </div>
                  <div className="titan-ai-typing">
                    <div className="titan-ai-typing-dot" />
                    <div className="titan-ai-typing-dot" />
                    <div className="titan-ai-typing-dot" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT BAR WITH VOICE DICTATION */}
            <div className="titan-ai-input-wrapper">
              <form
                className="titan-ai-input-bar"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend(inputValue);
                }}
              >
                <textarea
                  ref={textareaRef}
                  className="titan-ai-input"
                  placeholder={
                    isListening
                      ? 'Listening to voice dictation... Speak now.'
                      : 'Ask Titan about platform GMV, merchant drops, anomaly detection, inventory risks...'
                  }
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(inputValue);
                    }
                  }}
                  rows={1}
                  disabled={loading}
                />

                <div className="titan-ai-input-buttons">
                  {/* Voice Button */}
                  <button
                    type="button"
                    className={`titan-ai-mic-btn ${isListening ? 'listening' : ''}`}
                    onClick={toggleVoice}
                    title={
                      !voiceSupported
                        ? 'Voice input not supported in this browser'
                        : isListening
                        ? 'Stop listening'
                        : 'Voice dictation'
                    }
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    className="titan-ai-send-btn"
                    disabled={loading || !inputValue.trim()}
                    aria-label="Send message to Titan"
                    title="Send message"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
