/**
 * Device-local "opened this thread since the last message" tracking — powers this
 * browser's chat list dots and nav unread badge specifically. Distinct from the
 * server-side, per-message read receipt (`messages.read_at`, set via
 * `markConversationRead`) that drives the WhatsApp-style checkmarks the *other*
 * participant sees on their own sent messages — that one is cross-device and visible to
 * the sender; this one is purely local UI state for whoever's browsing this device.
 */

const STORAGE_KEY = "kattegat-chat-read";

type ChatReadState = {
  lastViewedAt: Record<string, string>;
};

type Listener = () => void;

const listeners = new Set<Listener>();
const EMPTY_VIEWED_AT: Record<string, string> = {};
let cachedViewedAt: Record<string, string> = EMPTY_VIEWED_AT;
let cachedSerialized = "";

function readState(): ChatReadState {
  if (typeof window === "undefined") return { lastViewedAt: EMPTY_VIEWED_AT };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedViewedAt = EMPTY_VIEWED_AT;
      cachedSerialized = "";
      return { lastViewedAt: EMPTY_VIEWED_AT };
    }
    if (raw === cachedSerialized) {
      return { lastViewedAt: cachedViewedAt };
    }
    const parsed = JSON.parse(raw) as ChatReadState;
    if (!parsed || typeof parsed !== "object" || typeof parsed.lastViewedAt !== "object") {
      cachedViewedAt = EMPTY_VIEWED_AT;
      cachedSerialized = "";
      return { lastViewedAt: EMPTY_VIEWED_AT };
    }
    cachedSerialized = raw;
    cachedViewedAt = parsed.lastViewedAt ?? EMPTY_VIEWED_AT;
    return { lastViewedAt: cachedViewedAt };
  } catch {
    cachedViewedAt = EMPTY_VIEWED_AT;
    cachedSerialized = "";
    return { lastViewedAt: EMPTY_VIEWED_AT };
  }
}

function writeState(state: ChatReadState) {
  if (typeof window === "undefined") return;
  try {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    cachedSerialized = serialized;
    cachedViewedAt = state.lastViewedAt;
  } catch {
    // ignore quota / private mode
  }
  listeners.forEach((listener) => listener());
}

/** Stable snapshot for useSyncExternalStore — same reference until data changes. */
export function getChatLastViewedAt(): Record<string, string> {
  return readState().lastViewedAt;
}

export function getServerChatLastViewedAt(): Record<string, string> {
  return EMPTY_VIEWED_AT;
}

export function markChatViewed(conversationId: string) {
  if (!conversationId) return;
  const current = readState();
  writeState({
    lastViewedAt: {
      ...current.lastViewedAt,
      [conversationId]: new Date().toISOString(),
    },
  });
}

export function subscribeChatReadStore(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isConversationUnread(input: {
  conversationId: string;
  lastMessageAt: string | null | undefined;
  lastMessageSenderId: string | null | undefined;
  myUserId: string;
  lastViewedAt?: Record<string, string>;
}): boolean {
  const { conversationId, lastMessageAt, lastMessageSenderId, myUserId } = input;
  if (!lastMessageAt) return false;
  if (!lastMessageSenderId || lastMessageSenderId === myUserId) return false;
  const viewedAt = (input.lastViewedAt ?? getChatLastViewedAt())[conversationId];
  if (!viewedAt) return true;
  return new Date(lastMessageAt).getTime() > new Date(viewedAt).getTime();
}
