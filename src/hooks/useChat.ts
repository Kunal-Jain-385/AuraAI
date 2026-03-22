import { useState, useEffect, useCallback } from 'react';
import { ChatSession, Message } from '../types';
import { saveChat, getChat, getAllChats, deleteChat, clearAllData } from '../lib/storage';

export const useChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);

  const loadSessions = useCallback(async () => {
    const all = await getAllChats();
    setSessions(all);
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const createNewSession = useCallback(async (modelId: string) => {
    const newSession: ChatSession = {
      id: crypto.randomUUID(),
      title: 'New Chat',
      messages: [],
      modelId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveChat(newSession);
    setSessions((prev) => [newSession, ...prev]);
    setCurrentSession(newSession);
    return newSession;
  }, []);

  const selectSession = useCallback(async (id: string) => {
    const session = await getChat(id);
    if (session) {
      setCurrentSession(session);
    }
  }, []);

  const addMessage = useCallback(async (sessionId: string, message: Message) => {
    const session = await getChat(sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        messages: [...session.messages, message],
        updatedAt: Date.now(),
      };
      
      // Update title if it's the first user message
      if (session.messages.length === 0 && message.role === 'user') {
        updatedSession.title = message.content.slice(0, 30) + (message.content.length > 30 ? '...' : '');
      }

      await saveChat(updatedSession);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? updatedSession : s)));
      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSession);
      }
    }
  }, [currentSession]);

  const removeSession = useCallback(async (id: string) => {
    await deleteChat(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (currentSession?.id === id) {
      setCurrentSession(null);
    }
  }, [currentSession]);

  const clearData = useCallback(async () => {
    await clearAllData();
    setSessions([]);
    setCurrentSession(null);
  }, []);

  const updateSessionContext = useCallback(async (sessionId: string, context: string) => {
    const session = await getChat(sessionId);
    if (session) {
      const updatedSession = {
        ...session,
        context,
        updatedAt: Date.now(),
      };
      await saveChat(updatedSession);
      setSessions((prev) => prev.map((s) => (s.id === sessionId ? updatedSession : s)));
      if (currentSession?.id === sessionId) {
        setCurrentSession(updatedSession);
      }
    }
  }, [currentSession]);

  return {
    sessions,
    currentSession,
    createNewSession,
    selectSession,
    addMessage,
    updateSessionContext,
    removeSession,
    clearData,
  };
};
