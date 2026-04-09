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
        <div className="space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold text-white">Admin Management</h1>
                <p className="text-slate-400">Review and approve community activities.</p>
            </header>

            {/* Pending Deposits */}
            <section className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    Pending Deposits
                </h2>
                {pendingDeposits.length === 0 ? (
                    <p className="text-slate-500 italic">No pending deposits to review.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-slate-500 text-sm border-b border-slate-800">
                                <tr>
                                    <th className="pb-3">Member</th>
                                    <th className="pb-3">Amount</th>
                                    <th className="pb-3">Method</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {pendingDeposits.map((dep) => (
                                    <tr key={dep.id} className="text-slate-300">
                                        <td className="py-4">
                                            <div className="font-medium text-white">{dep.user_name}</div>
                                            <div className="text-xs text-slate-500">{dep.user_phone}</div>
                                        </td>
                                        <td className="py-4 text-emerald-400 font-bold">₹{parseFloat(dep.amount).toLocaleString()}</td>
                                        <td className="py-4 text-sm">{dep.method}</td>
                                        <td className="py-4 text-sm">{new Date(dep.created_at).toLocaleDateString()}</td>
                                        <td className="py-4 text-right">
                                            <button
                                                onClick={() => approveDeposit(dep.id)}
                                                className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-sm transition-colors"
                                            >
                                                Approve
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
            <section className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Member Directory</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users.map((user) => (
                        <div key={user.id} className="bg-slate-800/30 p-4 rounded-xl border border-slate-800/50">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="text-white font-medium">{user.name}</h3>
                                    <p className="text-xs text-slate-500">{user.phone}</p>
                                </div>
                                <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full font-bold ${user.kyc_status === 'verified' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-yellow-400/10 text-yellow-400'
                                    }`}>
                                    {user.kyc_status}
                                </span>
                            </div>
                            <div className="flex justify-between items-end mt-4">
                                <div>
                                    <div className="text-[10px] text-slate-500 uppercase">Balance</div>
                                    <div className="text-white font-bold">₹{parseFloat(user.balance).toLocaleString()}</div>
                                </div>
                                {user.kyc_status !== 'verified' && (
                                    <button
                                        onClick={() => verifyUser(user.id)}
                                        className="text-xs bg-white text-black px-3 py-1 rounded-md font-bold hover:bg-slate-200 transition-colors"
                                    >
                                        Verify Member
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
