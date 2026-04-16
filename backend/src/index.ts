import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '@clerk/backend';
import 'dotenv/config';
import documentRoutes from './routes/documents';
import webhookRoutes from './routes/webhook';

// Types moved locally or imported from frontend for socket?
// We will just define the essential types directly or point to the frontend if needed,
// but since frontend/backend are separate, backend should ideally define them.
import {
    UserPresence,
    JoinDocumentPayload,
    DocumentUpdatePayload,
    CursorUpdatePayload,
    TitleUpdatePayload,
    TypingStatusPayload,
    RoomStatePayload
} from './types/socket';



const app = express();
app.use(cors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Apply JSON parser for standard APIs, BUT skip for webhooks where we need raw body
app.use('/api/webhook', webhookRoutes);

app.use(express.json());
app.use('/api/documents', documentRoutes);

// ----- SOCKET SERVER LOGIC -----
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

const roomState = new Map<string, Map<string, UserPresence>>();

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Missing token'));
        }

        const secretKey = process.env.CLERK_SECRET_KEY;
        if (!secretKey) {
            console.error('SERVER ERROR: Missing CLERK_SECRET_KEY');
            return next(new Error('Internal Server Error'));
        }

        const decoded = await verifyToken(token, { secretKey });
        if (!decoded || !decoded.sub) {
            return next(new Error('Authentication error: Invalid token'));
        }

        socket.data.userId = decoded.sub;
        next();
    } catch (err) {
        next(new Error('Authentication error: Token validation failed'));
    }
});

io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;

    socket.on('join-document', (payload: JoinDocumentPayload) => {
        const { documentId, userName, userColor } = payload;
        socket.join(documentId);

        if (!roomState.has(documentId)) {
            roomState.set(documentId, new Map());
        }

        const roomUsers = roomState.get(documentId)!;
        const presence: UserPresence = {
            userId,
            userName,
            userColor,
            cursor: null
        };

        roomUsers.set(userId, presence);

        const activeUsers = Array.from(roomUsers.values());
        socket.emit('room-state', { activeUsers } as RoomStatePayload);
        socket.to(documentId).emit('user-joined', presence);
    });

    socket.on('leave-document', (payload: { documentId: string; userId: string }) => {
        socket.leave(payload.documentId);

        if (roomState.has(payload.documentId)) {
            const roomUsers = roomState.get(payload.documentId)!;
            roomUsers.delete(payload.userId);

            if (roomUsers.size === 0) {
                roomState.delete(payload.documentId);
            }
        }

        socket.to(payload.documentId).emit('user-left', { userId: payload.userId });
    });

    socket.on('document-update', (payload: DocumentUpdatePayload) => {
        socket.to(payload.documentId).emit('document-update', {
            steps: payload.steps,
            version: payload.version,
            userId: payload.userId
        });
    });

    socket.on('cursor-update', (payload: CursorUpdatePayload) => {
        if (roomState.has(payload.documentId)) {
            const roomUsers = roomState.get(payload.documentId)!;
            const user = roomUsers.get(payload.userId);
            if (user) {
                user.cursor = payload.cursor;
            }
        }

        socket.to(payload.documentId).emit('cursor-update', {
            userId: payload.userId,
            cursor: payload.cursor
        });
    });

    socket.on('title-update', (payload: TitleUpdatePayload) => {
        socket.to(payload.documentId).emit('title-update', {
            title: payload.title,
            userId: payload.userId
        });
    });

    socket.on('typing-status', (payload: TypingStatusPayload) => {
        socket.to(payload.documentId).emit('typing-status', {
            userId: payload.userId,
            isTyping: payload.isTyping
        });
    });

    socket.on('disconnect', () => {
        for (const [documentId, roomUsers] of Array.from(roomState.entries())) {
            if (roomUsers.has(userId)) {
                roomUsers.delete(userId);
                io.to(documentId).emit('user-left', { userId });
                if (roomUsers.size === 0) {
                    roomState.delete(documentId);
                }
            }
        }
    });
});

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Verso Backend running on port ${PORT}`);
});
