import { Router, Request, Response } from 'express';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/backend';
import prisma from '../lib/prisma';
import express from 'express';

const router = Router();

// Clerk webhook needs raw body for Svix signature verification
router.post('/clerk', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        console.error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
        return res.status(500).json({ error: 'Webhook secret missing' });
    }

    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(400).json({ error: 'Error occurred -- no svix headers' });
    }

    const body = req.body.toString('utf8');

    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return res.status(400).json({ error: 'Error occurred' });
    }

    const eventType = evt.type;

    if (eventType === 'user.created' || eventType === 'user.updated') {
        const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;
        const email = email_addresses[0]?.email_address;
        const name = `${first_name || ''} ${last_name || ''}`.trim() || 'Anonymous User';

        if (!email) {
            return res.status(400).json({ error: 'Error: No email address associated with user' });
        }

        try {
            await prisma.user.upsert({
                where: { clerkId },
                update: {
                    email,
                    name,
                    avatarUrl: image_url,
                },
                create: {
                    clerkId,
                    email,
                    name,
                    avatarUrl: image_url,
                },
            });
            console.log(`User ${clerkId} successfully synced to database.`);
        } catch (error) {
            console.error('Failed to sync user to database:', error);
            return res.status(500).json({ error: 'Error syncing to DB' });
        }
    }

    res.status(200).json({ success: true });
});

export default router;
