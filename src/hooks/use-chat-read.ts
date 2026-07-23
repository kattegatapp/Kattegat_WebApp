"use client";

import { useSyncExternalStore } from "react";

import {
  getChatLastViewedAt,
  getServerChatLastViewedAt,
  markChatViewed,
  subscribeChatReadStore,
} from "@/lib/chat/chat-read-store";

export function useChatLastViewedAt() {
  return useSyncExternalStore(
    subscribeChatReadStore,
    getChatLastViewedAt,
    getServerChatLastViewedAt,
  );
}

export function useMarkChatViewed() {
  return markChatViewed;
}
