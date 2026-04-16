import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import EditorPage from "./EditorPage";
import { fetchFromAPI } from "@/lib/api.server";

export default async function DocumentRoute({ params }: { params: { id: string } }) {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fullDoc: any;
    try {
        fullDoc = await fetchFromAPI(`/documents/${params.id}`);
    } catch {
        redirect("/");
    }

    const role = fullDoc.currentUserRole || 'VIEWER';

    // Derive a deterministic color for the current user's socket presence
    const colors = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa'];
    const hash = user.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const color = colors[hash % colors.length];

    const userInfo = {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Anonymous User',
        email: user.emailAddresses[0]?.emailAddress || '',
        color,
        avatarUrl: user.imageUrl
    };

    const collaborators = fullDoc ? [
        { ...fullDoc.owner, role: 'OWNER' },
        ...fullDoc.accesses.map((a: any) => ({ ...a.user, role: a.role }))
    ] : [];

    return (
        <EditorPage
            documentId={params.id}
            initialTitle={fullDoc.title}
            initialContent={fullDoc.content}
            user={userInfo}
            role={role}
            initialCollaborators={collaborators}
        />
    );
}
