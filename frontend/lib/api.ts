const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    // @ts-expect-error window.Clerk typing isn't guaranteed
    const token = await window.Clerk?.session?.getToken();
    const headers: Record<string, string> = { 
        'Content-Type': 'application/json',
        ...options.headers as Record<string, string>
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BACKEND_URL}${endpoint}`, {
        ...options,
        headers
    });

    if (!res.ok) {
        throw new Error(await res.text());
    }
    return res.json();
}

export const api = {
    documents: {
        list: async () => fetchWithAuth('/api/documents'),
        create: async (title?: string) => fetchWithAuth('/api/documents', {
            method: 'POST',
            body: JSON.stringify({ title })
        }),
        get: async (id: string) => fetchWithAuth(`/api/documents/${id}`),
        update: async (id: string, data: { title?: string, content?: any }) => fetchWithAuth(`/api/documents/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data)
        }),
        delete: async (id: string) => fetchWithAuth(`/api/documents/${id}`, { method: 'DELETE' }),
        access: {
            grant: async (id: string, email: string, role: string) => fetchWithAuth(`/api/documents/${id}/access`, {
                method: 'POST',
                body: JSON.stringify({ email, role })
            }),
            revoke: async (id: string, userId: string) => fetchWithAuth(`/api/documents/${id}/access/${userId}`, { method: 'DELETE' })
        },
        versions: {
            list: async (id: string) => fetchWithAuth(`/api/documents/${id}/versions`),
            create: async (id: string, content: any) => fetchWithAuth(`/api/documents/${id}/versions`, {
                method: 'POST',
                body: JSON.stringify({ content })
            })
        }
    }
};
