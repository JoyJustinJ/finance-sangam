import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../api';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Profile() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [showPassModal, setShowPassModal] = useState(false);
    const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
    const [passError, setPassError] = useState('');
    const [passLoading, setPassLoading] = useState(false);

    useEffect(() => {
        getProfile()
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.error || 'Failed to load profile'))
            .finally(() => setLoading(false));
    }, []);

    const handlePassChange = async (e) => {
        e.preventDefault();
        if (passData.new !== passData.confirm) return setPassError('New passwords do not match');
        setPassLoading(true);
        setPassError('');
        try {
            await updateProfile({ currentPassword: passData.current, newPassword: passData.new });
            alert('Password updated successfully!');
            setShowPassModal(false);
            setPassData({ current: '', new: '', confirm: '' });
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.error || err.message || 'Connection error';
            setPassError(msg);
        } finally {
            setPassLoading(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center py-32 gap-3 text-on-surface-variant"><span className="material-symbols-outlined animate-spin">progress_activity</span>Loading profile...</div>;
    if (error) return <div className="flex items-center justify-center py-32 text-error gap-2"><span className="material-symbols-outlined">error</span>{error}</div>;

    const user = data?.user;
    const allTx = data?.transactions || [];
    const filteredTx = filter === 'all' ? allTx :
        filter === 'deposits' ? allTx.filter(t => t.type === 'credit') :
            filter === 'loans' ? allTx.filter(t => t.type === 'debit') :
                allTx.filter(t => t.title?.toLowerCase().includes('interest'));

    const storedUser = JSON.parse(localStorage.getItem('fs_user') || '{}');

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative">
            {/* Password Modal */}
            {showPassModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold dark:text-white">Security Update</h3>
                            <button onClick={() => setShowPassModal(false)} className="material-symbols-outlined text-slate-400 hover:text-red-500 transition-colors">close</button>
                        </div>
                        <form onSubmit={handlePassChange} className="space-y-4">
                            {passError && <div className="p-3 bg-red-100 text-red-600 text-xs rounded-xl font-bold">{passError}</div>}
                            <div>
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 block px-1">Current Password</label>
                                <input
                                    type="password" required
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 dark:text-white focus:ring-2 ring-blue-500 transition-all"
                                    value={passData.current}
                                    onChange={e => setPassData({ ...passData, current: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 block px-1">New Password</label>
                                <input
                                    type="password" required
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 dark:text-white focus:ring-2 ring-blue-500 transition-all"
                                    value={passData.new}
                                    onChange={e => setPassData({ ...passData, new: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1 block px-1">Confirm New Password</label>
                                <input
                                    type="password" required
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 dark:text-white focus:ring-2 ring-blue-500 transition-all"
                                    value={passData.confirm}
                                    onChange={e => setPassData({ ...passData, confirm: e.target.value })}
                                />
                            </div>
                            <button
                                disabled={passLoading}
                                className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-500/30 active:scale-95 transition-all disabled:opacity-50 mt-4"
                            >
                                {passLoading ? 'Verifying...' : 'Save New Password'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Profile Column */}
            <div className="lg:col-span-5 space-y-8">
                <section className="bg-surface-container-lowest rounded-full p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-primary overflow-hidden ring-4 ring-secondary-container/30 flex items-center justify-center">
                                <span className="material-symbols-outlined text-on-primary text-4xl">person</span>
                            </div>
                            <div className="absolute bottom-0 right-0 bg-secondary text-white p-1 rounded-full border-2 border-white">
                                <span className="material-symbols-outlined text-[16px] block">verified</span>
                            </div>
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-2xl font-extrabold font-headline text-primary tracking-tight">{user?.name || storedUser?.name}</h2>
                            <p className="text-on-surface-variant font-medium">+91 {user?.phone}</p>
                            <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-secondary-container text-on-secondary-container text-xs font-semibold rounded-full flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">task_alt</span>
                                    KYC: {user?.kyc_status}
                                </span>
                                <span className="px-3 py-1 bg-surface-container-high text-on-surface-variant text-xs font-medium rounded-full">
                                    Joined: {user?.joined_date}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-surface-container-low rounded-[2rem] p-8">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                            <p className="text-sm font-semibold text-secondary uppercase tracking-widest">Community Pulse</p>
                            <h3 className="text-xl font-bold font-headline text-primary">Trust Score: {user?.trust_score}</h3>
                        </div>
                        <span className="text-primary font-bold text-lg">Excellent</span>
                    </div>
                    <div className="h-4 w-full bg-surface-container-highest rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full" style={{ width: `${((user?.trust_score || 840) / 1000) * 100}%` }}></div>
                    </div>
                    <p className="mt-4 text-sm text-on-surface-variant leading-relaxed">Your contribution has placed you in the top 5% of members this month.</p>
                </section>

                {/* Account Stats */}
                <section className="grid grid-cols-2 gap-4">
                    {[
                        { label: 'Balance', value: fmt(user?.balance) },
                        { label: 'Total Deposited', value: fmt(user?.total_deposited) },
                        { label: 'Interest Earned', value: fmt(user?.interest_earned) },
                        { label: 'Borrowed', value: fmt(user?.borrowed_amount) },
                    ].map((s, i) => (
                        <div key={i} className="bg-surface-container-lowest p-4 rounded-xl">
                            <p className="text-[10px] uppercase font-bold text-on-surface-variant">{s.label}</p>
                            <p className="text-lg font-headline font-bold text-primary mt-1">{s.value}</p>
                        </div>
                    ))}
                </section>

                <section className="space-y-3">
                    <h3 className="text-sm font-bold opacity-60 uppercase tracking-[0.2em] px-2 text-on-surface-variant">Account Preferences</h3>
                    {[
                        { icon: 'lock', title: 'Change Password', desc: 'Update your login credentials', action: () => setShowPassModal(true) },
                        { icon: 'notifications_active', title: 'Notification Preferences', desc: 'Manage alerts and updates' },
                        { icon: 'shield', title: 'Security', desc: '2FA and biometric settings' }
                    ].map((s, i) => (
                        <button key={i} onClick={s.action} className="flex items-center justify-between w-full p-5 bg-surface-container-lowest hover:bg-surface-container-low transition-colors rounded-full group shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                    <span className="material-symbols-outlined">{s.icon}</span>
                                </div>
                                <div className="text-left">
                                    <p className="font-semibold text-on-surface">{s.title}</p>
                                    <p className="text-xs text-on-surface-variant">{s.desc}</p>
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-outline-variant">chevron_right</span>
                        </button>
                    ))}
                </section>
            </div>

            {/* Transactions Column */}
            <div className="lg:col-span-7 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-2xl font-extrabold font-headline text-primary tracking-tight">Transaction History</h3>
                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                        {['all', 'deposits', 'loans', 'interest'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap capitalize transition-colors ${filter === f ? 'bg-primary text-white' : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'}`}>
                                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-surface-container-lowest rounded-[2rem] p-4 md:p-8 space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                    {filteredTx.length === 0 ? (
                        <p className="text-center text-on-surface-variant py-8">No transactions found.</p>
                    ) : filteredTx.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between group cursor-pointer hover:opacity-80 transition-opacity">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-secondary-container/30 text-secondary' : 'bg-primary-container/10 text-primary'}`}>
                                    <span className="material-symbols-outlined">{tx.type === 'credit' ? 'trending_up' : 'payments'}</span>
                                </div>
                                <div>
                                    <p className="font-bold text-on-surface">{tx.title}</p>
                                    <p className="text-xs text-on-surface-variant font-medium">{tx.description} • {new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className={`font-bold text-lg ${tx.type === 'credit' ? 'text-secondary' : 'text-primary'}`}>
                                    {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                                </p>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${tx.type === 'credit' ? 'bg-secondary-container/50 text-on-secondary-container' : 'bg-primary-container/10 text-on-primary-container'}`}>
                                    {tx.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-primary p-8 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
                    <div className="z-10 text-center md:text-left">
                        <h4 className="text-xl font-bold font-headline text-white">Need financial assistance?</h4>
                        <p className="text-primary-fixed-dim text-sm max-w-xs">Our community managers are available 24/7 to help you.</p>
                    </div>
                    <button className="bg-secondary-container text-on-secondary-container px-8 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform z-10">Contact Support</button>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-secondary/20 rounded-full blur-3xl z-0"></div>
                </div>
            </div>
        </div>
    );
}
