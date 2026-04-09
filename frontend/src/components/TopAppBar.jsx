import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function TopAppBar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('fs_user') || '{}');
    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'FS';

    const handleLogout = () => {
        localStorage.removeItem('fs_token');
        localStorage.removeItem('fs_user');
        navigate('/login');
    };

    return (
        <header className="sticky top-0 z-40 flex items-center justify-between px-6 py-4 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary text-sm">account_balance</span>
                </div>
                <span className="font-headline font-extrabold text-primary text-lg tracking-tight">Finance Sangam</span>
            </div>
            <div className="flex items-center gap-3">
                <button className="w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors">
                    <span className="material-symbols-outlined text-xl">notifications</span>
                </button>
                <button
                    onClick={handleLogout}
                    title="Logout"
                    className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-sm hover:opacity-90 transition-opacity"
                >
                    {initials}
                </button>
            </div>
        </header>
    );
}
