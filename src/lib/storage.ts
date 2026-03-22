import { get, set, del, keys } from 'idb-keyval';
import { ChatSession } from '../types';

const CHATS_PREFIX = 'chat_';

export const saveChat = async (chat: ChatSession) => {
  await set(`${CHATS_PREFIX}${chat.id}`, chat);
};

export const getChat = async (id: string): Promise<ChatSession | undefined> => {
  return await get(`${CHATS_PREFIX}${id}`);
};

export const getAllChats = async (): Promise<ChatSession[]> => {
  const allKeys = await keys();
  const chatKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(CHATS_PREFIX));
  const chats = await Promise.all(chatKeys.map((k) => get(k as string)));
  return (chats.filter(Boolean) as ChatSession[]).sort((a, b) => b.updatedAt - a.updatedAt);
};

export const deleteChat = async (id: string) => {
  await del(`${CHATS_PREFIX}${id}`);
};

export const clearAllData = async () => {
  const allKeys = await keys();
  const chatKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith(CHATS_PREFIX));
  await Promise.all(chatKeys.map((k) => del(k as string)));
};
