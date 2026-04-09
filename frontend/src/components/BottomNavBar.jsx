import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNavBar() {
    const location = useLocation();

    const getLinkClass = (path) => {
        const isActive = location.pathname === path;
        if (isActive) {
            return "flex flex-col items-center justify-center bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 rounded-2xl px-5 py-1.5 active:scale-90 transition-transform duration-200";
        }
        return "flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 px-5 py-1.5 hover:text-blue-800 dark:hover:text-blue-300 active:scale-90 transition-transform duration-200";
    };

    return (
        <nav className="fixed bottom-0 left-0 w-full z-50 rounded-t-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 pb-safe bg-slate-100 dark:bg-slate-800">
                <Link className={getLinkClass('/')} to="/">
                    <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
                    <span className="font-inter text-[11px] font-medium">Dashboard</span>
                </Link>
                <Link className={getLinkClass('/community')} to="/community">
                    <span className="material-symbols-outlined" data-icon="group">group</span>
                    <span className="font-inter text-[11px] font-medium">Community</span>
                </Link>
                <Link className={getLinkClass('/deposit')} to="/deposit">
                    <span className="material-symbols-outlined" data-icon="swap_horiz">swap_horiz</span>
                    <span className="font-inter text-[11px] font-medium">Payments</span>
                </Link>
                <Link className={getLinkClass('/profile')} to="/profile">
                    <span className="material-symbols-outlined" data-icon="person">person</span>
                    <span className="font-inter text-[11px] font-medium">Profile</span>
                </Link>
            </div>
        </nav>
    );
}
