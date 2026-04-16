import { currentUser } from "@clerk/nextjs/server";
import { fetchFromAPI } from "@/lib/api.server";
import { DM_Serif_Display, Syne } from "next/font/google";
import { formatTimeAgo, cn } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, BookOpen } from "lucide-react";

const dmSerif = DM_Serif_Display({ weight: "400", subsets: ["latin"] });
const syne = Syne({ subsets: ["latin"], weight: ["500", "700"] });

export default async function DashboardHome() {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }

    const documents = await fetchFromAPI('/documents');

    // Server Action triggering backend document creation
    async function createDocument() {
        "use server";
        const doc = await fetchFromAPI('/documents', {
            method: 'POST',
            body: JSON.stringify({ title: 'Untitled' })
        });
        redirect(`/doc/${doc.id}`);
    }

    // Mock checking if active for visual demo requirement 
    const liveCount = documents.filter((doc: any) => new Date().getTime() - new Date(doc.lastEditedAt).getTime() < 1000 * 60 * 10).length;

    if (documents.length === 0) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center pt-24 pb-32">
                <BookOpen className="w-16 h-16 text-[#5a5650] mb-6 opacity-50" strokeWidth={1} />
                <h2 className={cn("text-2xl text-text-primary mb-2", syne.className)}>No documents yet</h2>
                <p className="text-text-muted text-sm mb-8">Create your first document to get started</p>
                <form action={createDocument}>
                    <button type="submit" className="bg-accent text-background px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                        <Plus size={18} />
                        <span>New Document</span>
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-8 py-16">
            <div className="mb-12">
                <h1 className={cn("text-[28px] text-text-primary tracking-wide mb-2", dmSerif.className)}>
                    Good morning, {user.firstName || 'User'}
                </h1>
                <p className="text-[#8a847c] text-sm">
                    You have {documents.length} document{documents.length !== 1 && 's'}. {liveCount > 0 ? `${liveCount} have active collaborators.` : ''}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {documents.map((doc: any) => {
                    const isLive = new Date().getTime() - new Date(doc.lastEditedAt).getTime() < 1000 * 60 * 10;

                    // Render avatars sequentially stacking them 
                    const collaborators = Array.from(new Set([doc.owner, ...doc.accesses.map((a: any) => a.user)])).slice(0, 4);

                    return (
                        <Link href={`/doc/${doc.id}`} key={doc.id}>
                            <div className="bg-[#161412] border border-[#2a2825] rounded-[10px] p-5 h-[140px] flex flex-col justify-between transition-all hover:border-[#3a3835] hover:-translate-y-1 hover:shadow-xl group relative">

                                {isLive && (
                                    <div className="absolute top-5 right-5 w-2 h-2 bg-live rounded-full animate-pulse shadow-[0_0_8px_rgba(90,158,111,0.6)]"></div>
                                )}

                                <div>
                                    <h3 className={cn("text-[15px] font-medium text-text-primary truncate pr-6", syne.className)}>
                                        {doc.title}
                                    </h3>
                                    <p className="text-[#5a5650] text-[12px] mt-1.5">
                                        {formatTimeAgo(doc.lastEditedAt)}
                                    </p>
                                </div>

                                <div className="flex items-center">
                                    {collaborators.map((c, idx) => (
                                        <div
                                            key={c.name + idx}
                                            className="w-6 h-6 rounded-full border-2 border-[#161412] bg-surface -ml-1.5 first:ml-0 flex items-center justify-center text-[9px] font-bold text-white overflow-hidden group-hover:border-[#3a3835] transition-colors"
                                            style={{ zIndex: collaborators.length - idx }}
                                        >
                                            {c.avatarUrl ? (
                                                /* eslint-disable-next-line @next/next/no-img-element */
                                                <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                                            ) : (
                                                c.name[0].toUpperCase()
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
