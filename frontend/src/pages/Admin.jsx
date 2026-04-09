import React, { useState, useEffect } from 'react';
import api from '../api';

const Admin = () => {
    const [pendingDeposits, setPendingDeposits] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const depositsRes = await api.get('/admin/pending-deposits');
            const usersRes = await api.get('/admin/users');
            setPendingDeposits(depositsRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error('Failed to fetch admin data');
        } finally {
            setLoading(false);
        }
    };

    const approveDeposit = async (id) => {
        if (!window.confirm('Are you sure you received this money?')) return;
        try {
            await api.post(`/admin/approve-deposit/${id}`);
            alert('Deposit Approved!');
            fetchAdminData();
        } catch (err) {
            alert('Failed to approve');
        }
    };

    const verifyUser = async (id) => {
        try {
            await api.post(`/admin/approve-user/${id}`);
            alert('User Verified!');
            fetchAdminData();
        } catch (err) {
            alert('Failed to verify');
        }
    };

    if (loading) return <div className="p-8 text-white">Loading management console...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            <header className="bg-gradient-to-r from-blue-600 to-indigo-700 -mx-6 -mt-6 p-10 rounded-b-[3rem] shadow-lg shadow-blue-500/20 mb-10">
                <h1 className="text-4xl font-extrabold text-white tracking-tight">Admin Control Center</h1>
                <p className="text-blue-100 mt-2 font-medium">Empowering your community's financial growth.</p>
            </header>

            {/* Pending Deposits */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                    <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-500/50"></span>
                    Deposit Verification
                </h2>
                {pendingDeposits.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-slate-400 dark:text-slate-500 italic">No pending deposits currently.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-slate-500 dark:text-slate-400 text-sm border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="pb-4 font-semibold uppercase tracking-wider text-[10px]">Member</th>
                                    <th className="pb-4 font-semibold uppercase tracking-wider text-[10px]">Amount</th>
                                    <th className="pb-4 font-semibold uppercase tracking-wider text-[10px]">Method</th>
                                    <th className="pb-4 font-semibold uppercase tracking-wider text-[10px]">Date</th>
                                    <th className="pb-4 text-right font-semibold uppercase tracking-wider text-[10px]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                                {pendingDeposits.map((dep) => (
                                    <tr key={dep.id} className="text-slate-700 dark:text-slate-300">
                                        <td className="py-5">
                                            <div className="font-bold text-slate-900 dark:text-white">{dep.user_name}</div>
                                            <div className="text-xs text-slate-500">{dep.user_phone}</div>
                                        </td>
                                        <td className="py-5">
                                            <span className="text-emerald-600 dark:text-emerald-400 font-black text-lg">₹{parseFloat(dep.amount).toLocaleString()}</span>
                                        </td>
                                        <td className="py-5">
                                            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold">
                                                {dep.method}
                                            </span>
                                        </td>
                                        <td className="py-5 text-sm font-medium">{new Date(dep.created_at).toLocaleDateString()}</td>
                                        <td className="py-5 text-right">
                                            <button
                                                onClick={() => approveDeposit(dep.id)}
                                                className="bg-blue-600 shadow-md shadow-blue-500/30 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition-all active:scale-95"
                                            >
                                                Verify Payment
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

            {/* User Management */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Community Directory</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <div key={user.id} className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-black text-xl">
                                    {user.name[0]}
                                </div>
                                <span className={`text-[10px] uppercase px-3 py-1 rounded-full font-black tracking-widest ${user.kyc_status === 'verified' ? 'bg-emerald-400/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-400/10 text-amber-600 dark:text-amber-400'
                                    }`}>
                                    {user.kyc_status}
                                </span>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{user.name}</h3>
                                <p className="text-sm font-medium text-slate-500">{user.phone}</p>
                            </div>
                            <div className="flex justify-between items-center py-4 border-t border-slate-200 dark:border-slate-800">
                                <div>
                                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Available Balance</div>
                                    <div className="text-2xl font-black text-slate-900 dark:text-white">₹{parseFloat(user.balance).toLocaleString()}</div>
                                </div>
                                {user.kyc_status !== 'verified' && (
                                    <button
                                        onClick={() => verifyUser(user.id)}
                                        className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-all active:scale-95"
                                    >
                                        Verify
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Admin;
