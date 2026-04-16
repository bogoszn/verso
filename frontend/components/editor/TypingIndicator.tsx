interface TypingIndicatorProps {
    typingUsers: string[];
    activeUsers: { userId: string; userName: string }[];
}

export function TypingIndicator({ typingUsers, activeUsers }: TypingIndicatorProps) {
    if (!typingUsers || typingUsers.length === 0) return null;

    // Map user IDs to names
    const names = typingUsers.map(id => {
        const user = activeUsers.find(u => u.userId === id);
        return user ? user.userName.split(' ')[0] : 'Someone';
    });

    let message = '';
    if (names.length === 1) {
        message = `${names[0]} is typing`;
    } else if (names.length === 2) {
        message = `${names[0]} and ${names[1]} are typing`;
    } else {
        message = 'Several people are typing';
    }

    return (
        <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium h-5 italic">
            <span>{message}</span>
            <div className="flex items-center gap-0.5 mt-1">
                <span className="w-1 h-1 bg-text-muted rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1 h-1 bg-text-muted rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1 h-1 bg-text-muted rounded-full animate-bounce"></span>
            </div>
        </div>
    );
}
