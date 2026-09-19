import api from './api';

export async function chatWithTitan({
  message,
  conversationHistory = [],
  conversationId = null,
  agentMode = 'auto',
  aiProviderPreference = 'auto',
  pageContext = null
}) {
  const response = await api.post('/admin-ai/chat', {
    message,
    conversationHistory,
    conversationId,
    agentMode,
    aiProviderPreference,
    pageContext
  });
  return response.data;
}

export async function getAdminAiSummary() {
  const response = await api.get('/admin-ai/summary');
  return response.data;
}

export async function generateAdminAiReport({ timeframe = '30d' } = {}) {
  const response = await api.post('/admin-ai/report-summary', {
    timeframe
  });
  return response.data;
}

export async function getAdminAiSuggestions() {
  const response = await api.get('/admin-ai/suggestions');
  return response.data;
}

// Titan Conversations Management
export async function getTitanConversations() {
  const response = await api.get('/admin-ai/conversations');
  return response.data;
}

export async function createTitanConversation(title = 'New Titan Audit', agentMode = 'platform_bi') {
  const response = await api.post('/admin-ai/conversations', { title, agentMode });
  return response.data;
}

export async function getTitanConversation(id) {
  const response = await api.get(`/admin-ai/conversations/${id}`);
  return response.data;
}

export async function renameTitanConversation(id, title) {
  const response = await api.patch(`/admin-ai/conversations/${id}`, { title });
  return response.data;
}

export async function deleteTitanConversation(id) {
  const response = await api.delete(`/admin-ai/conversations/${id}`);
  return response.data;
}

// Titan Settings Management
export async function getTitanSettings() {
  const response = await api.get('/admin-ai/settings');
  return response.data;
}

export async function updateTitanSettings(settings) {
  const response = await api.put('/admin-ai/settings', settings);
  return response.data;
}
