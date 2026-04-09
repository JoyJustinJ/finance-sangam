import React, { useState, useEffect } from 'react';
import { getDashboard } from '../api';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getDashboard()
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.error || 'Failed to load dashboard'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center py-32 gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            Loading dashboard...
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center py-32 text-error gap-2">
            <span className="material-symbols-outlined">error</span> {error}
        </div>
    );

    const recentTx = data?.recent_transactions || [];

    return (
        <>
            <section className="mt-8 mb-12 flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 space-y-2">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary leading-tight">
                        Welcome back, <br />Curating your prosperity.
                    </h1>
                    <p className="text-on-surface-variant max-w-md text-lg font-medium opacity-80">
                        Your community contributions have grown this month.
                    </p>
                </div>
                <div className="w-full md:w-auto flex flex-row gap-3">
                    <a href="/deposit" className="flex-1 md:flex-none px-8 py-4 bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold rounded-md active:scale-95 transition-transform text-center">
                        Deposit
                    </a>
                    <a href="/deposit" className="flex-1 md:flex-none px-8 py-4 bg-secondary-container text-on-secondary-container font-bold rounded-md active:scale-95 transition-transform text-center">
                        Borrow
                    </a>
                </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="md:col-span-2 md:row-span-2 bg-surface-container-lowest p-8 rounded-[0.75rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/10 relative overflow-hidden">
                    <div className="relative z-10">
                        <span className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase opacity-60">Current Balance</span>
                        <h2 className="text-5xl font-bold mt-4 text-primary">{fmt(data?.balance)}</h2>
                        <div className="mt-8 flex items-center gap-4">
                            <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full" style={{ width: `${Math.min(((data?.trust_score || 0) / 1000) * 100, 100)}%` }}></div>
                            </div>
                            <span className="text-sm font-bold text-secondary">{Math.round(((data?.trust_score || 0) / 1000) * 100)}%</span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-4 font-medium italic">"The Trust Meter": Community Score {data?.trust_score}</p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-fixed-dim/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                </div>

                <div className="bg-surface-container-low p-6 rounded-[0.75rem] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-on-surface-variant">Total Deposited</span>
                        <span className="material-symbols-outlined text-secondary">account_balance_wallet</span>
                    </div>
                    <p className="text-2xl font-bold text-on-surface mt-4">{fmt(data?.total_deposited)}</p>
                </div>

                <div className="bg-surface-container-low p-6 rounded-[0.75rem] flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <span className="text-sm font-medium text-on-surface-variant">Interest Earned</span>
                        <span className="material-symbols-outlined text-secondary">trending_up</span>
                    </div>
                    <p className="text-2xl font-bold text-on-surface mt-4">{fmt(data?.interest_earned)}</p>
                </div>

                <div className="bg-surface-container-low p-6 md:col-span-2 rounded-[0.75rem] flex flex-col justify-center border-l-4 border-primary">
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-sm font-medium text-on-surface-variant">Borrowed Amount</span>
                            <p className="text-3xl font-bold text-primary mt-1">{fmt(data?.borrowed_amount)}</p>
                        </div>
                        {data?.next_payment_date && (
                            <div className="text-right">
                                <span className="text-[10px] block uppercase font-bold tracking-widest text-on-surface-variant opacity-50">Next Payment</span>
                                <span className="text-sm font-bold text-error">{data.next_payment_date}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex justify-between items-end mb-4">
                        <h3 className="text-2xl font-bold text-primary">Recent Activity</h3>
                        <a href="/profile" className="text-sm font-bold text-on-primary-container hover:underline">View Ledger</a>
                    </div>
                    <div className="space-y-4">
                        {recentTx.length === 0 ? (
                            <p className="text-on-surface-variant text-center py-8">No transactions yet.</p>
                        ) : recentTx.map((tx) => (
                            <div key={tx.id} className="group flex items-center justify-between p-5 bg-surface-container-lowest rounded-[0.75rem] hover:bg-surface-container-low transition-colors duration-200">
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'credit' ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-primary'}`}>
                                        <span className="material-symbols-outlined">{tx.type === 'credit' ? 'add_circle' : 'payments'}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-on-surface">{tx.title}</p>
                                        <p className="text-sm text-on-surface-variant">{tx.description}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${tx.type === 'credit' ? 'text-secondary' : 'text-primary'}`}>
                                        {tx.type === 'credit' ? '+' : '-'}{fmt(tx.amount)}
                                    </p>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${tx.status === 'COMPLETED' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-high text-on-surface-variant'}`}>
                                        {tx.status}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-primary p-8 rounded-[0.75rem] text-on-primary relative overflow-hidden h-full min-h-[300px]">
                        <h3 className="text-xl font-bold mb-6">Community Pulse</h3>
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full border border-on-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-secondary-fixed">group</span>
                                </div>
                                <div>
                                    <p className="text-sm opacity-70">Active Members</p>
                                    <p className="text-xl font-bold">{(data?.community?.active_members || 1248).toLocaleString('en-IN')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full border border-on-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-tertiary-fixed-dim">volunteer_activism</span>
                                </div>
                                <div>
                                    <p className="text-sm opacity-70">Total Shared Capital</p>
                                    <p className="text-xl font-bold">₹{((data?.community?.total_capital || 12000000) / 10000000).toFixed(1)} Cr</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-12 bg-white/10 backdrop-blur-md p-4 rounded-xl">
                            <p className="text-xs font-medium italic opacity-80">"Sangam represents the strength of many. Together, we are building a legacy of financial freedom."</p>
                        </div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-secondary/20 rounded-full blur-2xl -mb-10 -mr-10"></div>
                    </div>
                </div>
            </section>
        </>
    );
}
