'use strict';
import axios from 'axios';

const setAuthHeaders = () => {
  const token = window.localStorage.getItem('user_token');
  if (!token) return;
  return { headers: { Authorization: token } };
};

const storeAndPass = res => {
  const botId = (res.data.state || res.data.data).id;
  window.localStorage.setItem('lastUsedBot', botId);
  return res;
};

export const getBot = (id, storyId = '') => {
  if (storyId) {
    const config = Object.assign(setAuthHeaders() || {}, { params: { storyId } });
    return axios.get(`/api/bot/${id}`, config).then(storeAndPass);
  }
  return axios.get(`/api/bot/${id}`, setAuthHeaders()).then(storeAndPass);
};

export const putBot = (id, data) =>
  axios.put(`/api/bot/${id}`, data, setAuthHeaders());

export const postBot = (data) =>
  axios.post('/api/bot', data, setAuthHeaders()).then(storeAndPass);

export const delBot = (id) =>
  axios.delete(`/api/bot/${id}`, setAuthHeaders());

export const forkBot = (id, payload) =>
  axios.post(`/api/bot/${id}/fork`, payload);

export const newMessage = (id, storyId, message, messagePosition) =>
  axios.post(`/api/bot/${id}/stories/${storyId}/message`, { message, messagePosition }, setAuthHeaders());

export const deleteMessage = (id, storyId, messageId, idsToDelete) =>
  axios.delete(
    `/api/bot/${id}/stories/${storyId}/message/${messageId}`,
    Object.assign(setAuthHeaders() || {}, { params: { children: idsToDelete.join(',') } })
  );

export const updateMessage = (id, storyId, messageId, message, idsToDelete) =>
  axios.put(`/api/bot/${id}/stories/${storyId}/message/${messageId}`, { message, idsToDelete }, setAuthHeaders());

export const addActionToMessage = (id, storyId, messageId, action) =>
  axios.post(`/api/bot/${id}/stories/${storyId}/message/${messageId}/actions`, { action }, setAuthHeaders());

export const removeTargetFromAction = (id, storyId, messageId, actionIndex, attachmentIndex, targetAction, targetMessageId) =>
  axios.post(`/api/bot/${id}/stories/${storyId}/message/${messageId}/targets/delete`, { actionIndex, attachmentIndex, targetAction, targetMessageId }, setAuthHeaders());

export const moveMessage = (id, storyId, source, target) =>
  axios.post(`/api/bot/${id}/stories/${storyId}/message/move`, { source, target }, setAuthHeaders());

export const createBotStory = (id, storyId, storyName) =>
  axios.post(`/api/bot/${id}/stories`, { storyId, storyName }, setAuthHeaders());

export const getBotStory = (id, storyId) =>
  axios.get(`/api/bot/${id}/stories/${storyId}`, setAuthHeaders());

export const deleteBotStory = (id, storyId) =>
  axios.delete(`/api/bot/${id}/stories/${storyId}`, setAuthHeaders());

export const renameBotStory = (id, storyId, data) =>
  axios.put(`/api/bot/${id}/stories/${storyId}/rename`, data, setAuthHeaders());

export const updateBotStory = (id, storyId, data) =>
  axios.put(`/api/bot/${id}/stories/${storyId}`, data, setAuthHeaders());

export const duplicateBotStory = (id, storyId, data) =>
  axios.put(`/api/bot/${id}/stories/${storyId}/duplicate`, data, setAuthHeaders());

export const migrateBot = (id) =>
  axios.put(`/api/bot/${id}/migrate`, {}, setAuthHeaders());

export const getLocalBots = (id) =>
  axios.get(`/api/local-bots/${id}`, setAuthHeaders());

export const addLocalBot = (id, data) =>
  axios.post(`/api/local-bots/${id}`, data, setAuthHeaders());

export const putLocalBots = (id, data) =>
  axios.put(`/api/local-bots/${id}`, data, setAuthHeaders());

export const deleteLocalBot = (id, botId) =>
  axios.delete(`/api/local-bots/${id}/${botId}`, setAuthHeaders());

export const getMe = () =>
  axios.get('/api/users/me', setAuthHeaders());

export const getSystemNotifications = (userId) =>
  axios.get(`/api/notifications/${userId}`, setAuthHeaders());

export const ackSystemNotification = (notificationId, userId) =>
  axios.put(`/api/notifications/${notificationId}/${userId}`, setAuthHeaders());
