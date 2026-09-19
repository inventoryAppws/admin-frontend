import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MessageSquare, Trash2, Edit2, Check, Clock } from 'lucide-react';
import {
  getTitanConversations,
  createTitanConversation,
  renameTitanConversation,
  deleteTitanConversation
} from '../services/adminAiService';
import { toast } from './Toast';

export default function AdminAiHistory({
  onSelectConversation,
  onStartNewChat,
  onBack,
  activeConversationId,
  currentAgentMode
}) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const loadConversations = async () => {
    try {
      const data = await getTitanConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Could not load Titan conversations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const handleStartNew = async () => {
    try {
      const newConv = await createTitanConversation('New Platform Audit', currentAgentMode);
      if (onStartNewChat) onStartNewChat(newConv);
      toast.success('Started new Titan audit');
      if (onBack) onBack();
    } catch {
      if (onStartNewChat) onStartNewChat();
      if (onBack) onBack();
    }
  };

  const handleRename = async (id) => {
    if (!editTitle.trim()) return;
    try {
      await renameTitanConversation(id, editTitle.trim());
      setConversations((prev) =>
        prev.map((c) => (c._id === id ? { ...c, title: editTitle.trim() } : c))
      );
      setEditingId(null);
      toast.success('Session renamed');
    } catch {
      toast.error('Could not rename session');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      await deleteTitanConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      toast.success('Audit session deleted');
      if (activeConversationId === id && onStartNewChat) {
        onStartNewChat();
      }
    } catch {
      toast.error('Could not delete audit session');
    }
  };

  return (
    <div className="titan-ai-subpanel">
      <div className="titan-ai-subpanel-header">
        <div className="titan-ai-subpanel-header-left">
          <button type="button" className="titan-ai-subpanel-back-btn" onClick={onBack} title="Back to Chat">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h3>Audit History</h3>
            <p>Saved platform operations &amp; risk investigations</p>
          </div>
        </div>
        <button type="button" className="titan-ai-subpanel-action-btn" onClick={handleStartNew}>
          <Plus size={15} />
          <span>New Audit</span>
        </button>
      </div>

      {loading ? (
        <div className="titan-ai-subpanel-loading">
          <div className="titan-ai-spinner" />
          <span>Loading audit history...</span>
        </div>
      ) : conversations.length === 0 ? (
        <div className="titan-ai-subpanel-empty">
          <MessageSquare size={38} className="titan-ai-empty-icon" />
          <h4>No previous investigations</h4>
          <p>Your platform audit sessions with Titan will appear here.</p>
          <button type="button" className="titan-ai-btn-primary" onClick={handleStartNew}>
            Start New Audit
          </button>
        </div>
      ) : (
        <div className="titan-ai-history-list">
          {conversations.map((c) => {
            const isActive = activeConversationId === c._id;
            const isEditing = editingId === c._id;

            return (
              <div
                key={c._id}
                className={`titan-ai-history-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (!isEditing && onSelectConversation) {
                    onSelectConversation(c._id);
                    if (onBack) onBack();
                  }
                }}
              >
                <div className="titan-ai-history-icon">
                  <MessageSquare size={16} />
                </div>

                <div className="titan-ai-history-info">
                  {isEditing ? (
                    <div className="titan-ai-history-edit-row" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        className="titan-ai-history-input"
                      />
                      <button type="button" onClick={() => handleRename(c._id)}>
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <strong className="titan-ai-history-title">{c.title}</strong>
                      <div className="titan-ai-history-meta">
                        <span className="titan-ai-history-date">
                          <Clock size={11} />
                          {new Date(c.updatedAt).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        {c.messageCount > 0 && (
                          <span className="titan-ai-history-count">{c.messageCount} msgs</span>
                        )}
                        {c.agentMode && (
                          <span className="titan-ai-history-mode-tag">
                            {c.agentMode.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="titan-ai-history-actions" onClick={(e) => e.stopPropagation()}>
                  {!isEditing && (
                    <button
                      type="button"
                      className="titan-ai-icon-action"
                      title="Rename"
                      onClick={() => {
                        setEditingId(c._id);
                        setEditTitle(c.title);
                      }}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    className="titan-ai-icon-action delete"
                    title="Delete"
                    onClick={(e) => handleDelete(c._id, e)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

