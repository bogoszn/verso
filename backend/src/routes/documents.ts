import { Router, Response } from 'express';
import { requireAuth, AuthenticatedRequest, getDocumentWithAccess } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

const router = Router();

// GET /api/documents
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const documents = await prisma.document.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { accesses: { some: { userId: userId } } }
                ]
            },
            include: {
                owner: { select: { name: true, avatarUrl: true } },
                accesses: { where: { userId: userId }, select: { role: true } }
            },
            orderBy: { lastEditedAt: 'desc' }
        });

        const formattedDocs = documents.map((doc: any) => ({
            id: doc.id,
            title: doc.title,
            updatedAt: doc.updatedAt,
            lastEditedAt: doc.lastEditedAt,
            owner: doc.owner,
            role: doc.ownerId === userId ? 'ADMIN' : (doc.accesses[0]?.role || 'VIEWER')
        }));

        res.status(200).json(formattedDocs);
    } catch (error: any) {
        res.status(401).json({ error: error.message || 'Unauthorized' });
    }
});

// POST /api/documents
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const title = req.body.title || 'Untitled';

        const doc = await prisma.document.create({
            data: {
                title,
                ownerId: userId,
                content: { type: "doc", content: [] }
            }
        });
        res.status(201).json(doc);
    } catch (error: any) {
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// GET /api/documents/:id
router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { role } = await getDocumentWithAccess(req.params.id, userId);

        const fullDoc = await prisma.document.findUnique({
            where: { id: req.params.id },
            include: {
                owner: { select: { id: true, name: true, avatarUrl: true, email: true } },
                accesses: { include: { user: { select: { id: true, name: true, avatarUrl: true, email: true } } } },
                comments: { include: { author: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' } }
            }
        });

        res.status(200).json({ ...fullDoc, currentUserRole: role });
    } catch (error: any) {
        res.status(403).json({ error: error.message });
    }
});

// PATCH /api/documents/:id
router.patch('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { role } = await getDocumentWithAccess(req.params.id, userId);
        
        if (role === 'VIEWER') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const body = req.body;
        const updateData: { lastEditedAt: Date; title?: string; content?: Prisma.InputJsonValue } = { lastEditedAt: new Date() };
        if (body.title !== undefined) updateData.title = body.title;
        if (body.content !== undefined) updateData.content = body.content;

        const updated = await prisma.document.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.status(200).json(updated);
    } catch (error: any) {
        res.status(403).json({ error: error.message });
    }
});

// DELETE /api/documents/:id
router.delete('/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const userId = req.userId!;
        const { document } = await getDocumentWithAccess(req.params.id, userId);
        
        if (document.ownerId !== userId) {
            return res.status(403).json({ error: 'Only owner can delete' });
        }

        await prisma.document.delete({ where: { id: req.params.id } });
        res.status(200).json({ success: true });
    } catch (error: any) {
        res.status(403).json({ error: error.message });
    }
});

export default router;
