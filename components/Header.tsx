import React from 'react';

interface HeaderProps {
    title: string | React.ReactNode;
    subtitle?: string;
    rightContent?: React.ReactNode;
    className?: string;
}

const Header: React.FC<HeaderProps> = ({
    title,
    subtitle,
    rightContent,
    className = ""
}) => {
    return (
        <header className={`h-24 px-10 border-b border-white/10 bg-brand-navy/40 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl ${className}`}>
            <div>
                <h2 className="text-xl font-display font-black uppercase tracking-tight text-white">
                    {title}
                </h2>
                {subtitle && (
                    <p className="text-white/40 text-xs font-medium uppercase tracking-wider mt-0.5">
                        {subtitle}
                    </p>
                )}
            </div>

            {rightContent && (
                <div className="flex items-center gap-8 text-white">
                    {rightContent}
                </div>
            )}
        </header>
    );
};

export default Header;
