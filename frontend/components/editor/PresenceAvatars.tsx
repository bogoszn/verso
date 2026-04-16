

interface UserInfo {
    userId: string;
    userName: string;
    userColor: string;
    avatarUrl?: string;
}

interface PresenceAvatarsProps {
    activeUsers: UserInfo[];
}

export function PresenceAvatars({ activeUsers }: PresenceAvatarsProps) {
    if (!activeUsers || activeUsers.length === 0) return null;

    const maxVisible = 4;
    const visibleUsers = activeUsers.slice(0, maxVisible);
    const overflow = activeUsers.length > maxVisible ? activeUsers.length - maxVisible : 0;

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div className="flex items-center">
            {visibleUsers.map((user, index) => (
                <div
                    key={user.userId + index} // Use index fallback in case of strict mode duplicate joins
                    className="relative group -ml-2 first:ml-0 rounded-full border-2 border-background w-8 h-8 flex items-center justify-center text-xs font-bold transition-transform hover:z-10 hover:-translate-y-1 shadow-sm"
                    style={{ backgroundColor: user.userColor, zIndex: index }}
                >
                    {user.avatarUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={user.avatarUrl} alt={user.userName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span className="text-white drop-shadow-md">{getInitials(user.userName || 'Unknown')}</span>
                    )}

                    <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-surface text-text-primary px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-20 shadow-md border border-border">
                        {user.userName}
                    </div>
                </div>
            ))}

            {overflow > 0 && (
                <div
                    className="relative -ml-2 rounded-full border-2 border-background bg-surface text-text-muted w-8 h-8 flex items-center justify-center text-xs font-bold z-10 shadow-sm"
                >
                    +{overflow}
                </div>
            )}
        </div>
    );
}
