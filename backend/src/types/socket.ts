export interface UserPresence {
    userId: string;
    userName: string;
    userColor: string;
    cursor: { from: number; to: number } | null;
}

export interface JoinDocumentPayload {
    documentId: string;
    userId: string;
    userName: string;
    userColor: string;
}

export interface DocumentUpdatePayload {
    documentId: string;
    userId: string;
    steps: any[];
    version: number;
}

export interface CursorUpdatePayload {
    documentId: string;
    userId: string;
    cursor: { from: number; to: number } | null;
}

export interface TitleUpdatePayload {
    documentId: string;
    userId: string;
    title: string;
}

export interface TypingStatusPayload {
    documentId: string;
    userId: string;
    isTyping: boolean;
}

export interface RoomStatePayload {
    activeUsers: UserPresence[];
}
