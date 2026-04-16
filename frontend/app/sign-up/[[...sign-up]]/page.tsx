import { SignUp } from "@clerk/nextjs";
import { Syne } from "next/font/google";

const syne = Syne({ subsets: ["latin"] });

export default function SignUpPage() {
    return (
        <div className={`min-h-screen bg-background flex flex-col items-center justify-center p-4 ${syne.className}`}>
            <div className="mb-8 flex flex-col items-center">
                <div className="w-16 h-16 bg-accent text-background flex items-center justify-center text-3xl font-bold shadow-lg">
                    V
                </div>
                <h1 className="mt-4 text-text-primary text-2xl tracking-widest uppercase font-bold">Verso</h1>
            </div>
            <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
        </div>
    );
}
