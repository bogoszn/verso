import { Sidebar } from "@/components/sidebar/Sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { fetchFromAPI } from "@/lib/api.server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    const user = await currentUser();
    if (!user) redirect("/sign-in");

    // Fetch from backend API securely
    const documents = await fetchFromAPI('/documents').catch(() => []);

    // Server Action triggering backend document creation
    async function createDocument() {
        "use server";
        const doc = await fetchFromAPI('/documents', {
            method: 'POST',
            body: JSON.stringify({ title: 'Untitled' })
        });
        redirect(`/doc/${doc.id}`);
    }

    return (
        <div className="flex h-screen w-full bg-[#111009] overflow-hidden text-[#e8e3da]">
            <Sidebar documents={documents} createDocumentAction={createDocument} />
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
