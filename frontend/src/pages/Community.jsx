import React, { useEffect, useState } from 'react';
import { getCommunity } from '../api';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function Community() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        getCommunity()
            .then(res => setData(res.data))
            .catch(err => setError(err.response?.data?.error || 'Failed to load community'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="flex items-center justify-center py-32 gap-3 text-on-surface-variant"><span className="material-symbols-outlined animate-spin">progress_activity</span>Loading community...</div>;
    if (error) return <div className="flex items-center justify-center py-32 text-error gap-2"><span className="material-symbols-outlined">error</span>{error}</div>;

    const members = data?.members || [];
    const totalPooled = data?.total_pooled || 0;
    const totalLoans = data?.total_loans || 0;
    const totalRepayments = data?.total_repayments || 0;

    return (
        <>
            <section className="mb-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <div className="md:col-span-8">
                    <h1 className="font-headline font-extrabold text-4xl md:text-5xl text-on-surface tracking-tight mb-4 leading-tight">
                        Our Financial <br /><span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Sanctuary</span>
                    </h1>
                    <p className="text-on-surface-variant text-lg max-w-xl">
                        Transparency drives trust. Explore the collective growth of our Sangam through real-time ledger data.
                    </p>
                </div>
                <div className="md:col-span-4 flex justify-start md:justify-end">
                    <div className="bg-tertiary-fixed-dim/20 px-4 py-2 rounded-full flex items-center gap-2">
                        <span className="material-symbols-outlined text-on-tertiary-fixed-variant">verified_user</span>
                        <span className="text-on-tertiary-fixed-variant text-sm font-semibold">Verified Sangam Elite</span>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="bg-surface-container-low p-8 rounded-full flex flex-col justify-between hover:bg-surface-container-high transition-colors duration-300">
                    <div>
                        <span className="material-symbols-outlined text-primary mb-4 block">group</span>
                        <h3 className="text-on-surface-variant text-sm uppercase tracking-widest font-semibold">Total Members</h3>
                    </div>
                    <div className="mt-8">
                        <span className="text-5xl font-headline font-bold text-on-surface">{(data?.total_members || 1248).toLocaleString('en-IN')}</span>
                        <div className="mt-2 flex items-center gap-1 text-secondary font-semibold text-sm">
                            <span className="material-symbols-outlined text-xs">trending_up</span>
                            <span>+12% this month</span>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 bg-primary-container p-8 rounded-full relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20"></div>
                    <div className="relative z-10">
                        <span className="material-symbols-outlined text-primary-fixed mb-4 block">account_balance_wallet</span>
                        <h3 className="text-primary-fixed-dim text-sm uppercase tracking-widest font-semibold">Total Pooled Money</h3>
                    </div>
                    <div className="mt-12 relative z-10 flex flex-col md:flex-row md:items-baseline md:gap-4">
                        <span className="text-5xl font-headline font-extrabold text-white tracking-tighter">{fmt(totalPooled)}</span>
                        <span className="text-primary-fixed-dim">Circulating Capital</span>
                    </div>
                </div>
            </section>

            <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="font-headline font-bold text-2xl text-on-surface">Transparency Ledger</h2>
                    <div className="flex items-center gap-2 text-primary font-medium text-sm cursor-pointer hover:underline">
                        <span>Export Audit Log</span>
                        <span className="material-symbols-outlined text-sm">download</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
                    {[
                        { label: 'Aggregate Deposits', value: fmt(totalPooled), pct: 85, color: 'bg-secondary' },
                        { label: 'Loans Issued', value: fmt(totalLoans), pct: 65, color: 'bg-primary' },
                        { label: 'Repayments', value: fmt(totalRepayments), pct: 92, color: 'bg-tertiary-fixed-dim' },
                    ].map((item, i) => (
                        <div key={i} className={`bg-surface-container-lowest p-8 ${i === 0 ? 'rounded-l-full' : i === 2 ? 'rounded-r-full' : ''} ${i < 2 ? 'md:border-r border-surface-container' : ''}`}>
                            <h4 className="text-on-surface-variant text-xs font-bold uppercase mb-2">{item.label}</h4>
                            <p className="text-3xl font-headline font-bold text-on-surface">{item.value}</p>
                            <div className="mt-4 w-full bg-surface-container h-1 rounded-full">
                                <div className={`${item.color} h-1 rounded-full`} style={{ width: `${item.pct}%` }}></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-24">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="font-headline font-bold text-2xl text-on-surface">Member Spotlight</h2>
                    <button className="bg-secondary-container text-on-secondary-container px-6 py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition-opacity">
                        Join Community
                    </button>
                </div>
                <div className="space-y-4">
                    {members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between p-4 bg-surface-container-lowest hover:bg-surface-container-low rounded-full transition-all duration-200 cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm bg-surface-container-high flex items-center justify-center">
                                    {m.avatar_url ? (
                                        <img alt={m.name} className="w-full h-full object-cover" src={m.avatar_url} />
                                    ) : (
                                        <span className="material-symbols-outlined text-primary">person</span>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-headline font-bold text-on-surface">{m.name}</h4>
                                    <p className="text-on-surface-variant text-sm">Joined {m.joined_date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-8 px-6">
                                <div className="text-right">
                                    <span className="block text-[10px] uppercase text-on-surface-variant font-bold">Contribution</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-24 h-2 bg-surface-container rounded-full overflow-hidden">
                                            <div className="bg-gradient-to-r from-secondary to-primary h-full" style={{ width: `${m.contribution_pct}%` }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-primary">{m.level}</span>
                                    </div>
                                </div>
                                <span className="material-symbols-outlined text-outline-variant group-hover:text-primary transition-colors">chevron_right</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
