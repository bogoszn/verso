import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '@clerk/backend';
import prisma from '../lib/prisma';
import { User } from '@prisma/client';

export interface AuthenticatedRequest extends Request {
    userId?: string;
    user?: User;
}

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing token' });
        }

        const token = authHeader.split(' ')[1];
        const secretKey = process.env.CLERK_SECRET_KEY;

        if (!secretKey) {
            console.error('SERVER ERROR: Missing CLERK_SECRET_KEY');
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        const decoded = await verifyToken(token, { secretKey });
        if (!decoded || !decoded.sub) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        req.userId = decoded.sub;

        // Fetch user from DB
        let user = await prisma.user.findUnique({
            where: { clerkId: decoded.sub }
        });

        // We can't automatically sync from Clerk here like in Next.js without a Clerk client, 
        // but Clerk webhook should have already created the user.
        if (user) {
            req.user = user;
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({ error: 'Unauthorized' });
    }
};

export const getDocumentWithAccess = async (documentId: string, userId: string) => {
    const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
            owner: true,
            accesses: {
                where: { userId }
            }
        }
    });

    if (!document) {
        throw new Error('Document not found');
    }

    if (document.ownerId === userId) {
        return { document, role: 'ADMIN' };
    }

    if (document.accesses.length > 0) {
        return { document, role: document.accesses[0].role };
    }

    if (document.isPublic) {
        return { document, role: 'VIEWER' };
    }

    throw new Error('Forbidden: You do not have access to this document');
};
