import React from 'react';
import TopAppBar from './TopAppBar';
import BottomNavBar from './BottomNavBar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="min-h-screen">
            <TopAppBar />
            <main className="pt-20 pb-24 px-6 max-w-7xl mx-auto min-h-[calc(100vh-160px)]">
                <Outlet />
            </main>
            <BottomNavBar />
        </div>
    );
}
