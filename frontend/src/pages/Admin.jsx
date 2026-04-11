import React, { useState, useEffect } from 'react';
import api from '../api';
import { toast } from 'react-hot-toast';

const Admin = () => {
    const [pendingDeposits, setPendingDeposits] = useState([]);
    const [pendingLoans, setPendingLoans] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            const depositsRes = await api.get('/admin/pending-deposits');
            const loansRes = await api.get('/admin/pending-loans');
            const usersRes = await api.get('/admin/users');
            setPendingDeposits(depositsRes.data);
            setPendingLoans(loansRes.data);
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
            toast.success('Deposit Approved!');
            fetchAdminData();
        } catch (err) {
            toast.error('Failed to approve');
        }
    };

    const verifyUser = async (id) => {
        try {
            await api.post(`/admin/approve-user/${id}`);
            toast.success('User Verified!');
            fetchAdminData();
        } catch (err) {
            toast.error('Failed to verify');
        }
    };

    const rejectDeposit = async (id) => {
        if (!window.confirm('Are you sure you want to reject this deposit?')) return;
        try {
            await api.post(`/admin/reject-deposit/${id}`);
            toast.success('Deposit Rejected');
            fetchAdminData();
        } catch (err) {
            toast.error('Failed to reject');
        }
    };

    const approveLoan = async (id) => {
        if (!window.confirm('Approve this loan for disbursement?')) return;
        try {
            await api.post(`/admin/approve-loan/${id}`);
            toast.success('Loan Approved!');
            fetchAdminData();
        } catch (err) {
            toast.error('Failed to approve loan');
        }
    };

    const rejectLoan = async (id) => {
        if (!window.confirm('Are you certain you want to reject this loan application?')) return;
        try {
            await api.post(`/admin/reject-loan/${id}`);
            toast.success('Loan Application Rejected');
            fetchAdminData();
        } catch (err) {
            toast.error('Failed to reject loan');
        }
    };

    const wipeSystem = async () => {
        const confirm1 = window.confirm('CRITICAL: This will delete ALL transactions and users except yourself. Are you 100% sure?');
        if (!confirm1) return;
        const confirm2 = window.prompt('Type "DELETE EVERYTHING" to confirm:');
        if (confirm2 !== 'DELETE EVERYTHING') return;

        try {
            await api.post('/admin/wipe-system');
            toast.success('System Wiped. Everything is fresh!');
            fetchAdminData();
        } catch (err) {
            toast.error('Failed to wipe system');
        }
    };

    if (loading) return <div className="p-8 text-white">Loading management console...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12 text-on-surface">
            <header className="bg-gradient-to-r from-primary to-primary-container -mx-6 -mt-6 p-10 rounded-b-[3rem] shadow-lg shadow-primary/20 mb-10 text-on-primary">
                <h1 className="text-4xl font-extrabold tracking-tight">Admin Control Center</h1>
                <p className="mt-2 font-medium opacity-90">Real-time oversight for your community funds.</p>
            </header>

            {/* Pending Deposits */}
            <section className="bg-surface-container-low rounded-3xl border border-outline-variant p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-3 h-3 bg-amber-500 rounded-full animate-pulse shadow-lg shadow-amber-500/50"></span>
                    Deposit Verification
                </h2>
                {pendingDeposits.length === 0 ? (
                    <div className="text-center py-10 bg-surface-container-high rounded-2xl border border-dashed border-outline-variant">
                        <p className="text-on-surface-variant italic">No pending deposits currently.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-on-surface-variant text-xs uppercase tracking-widest border-b border-outline-variant">
                                    <th className="pb-4 font-bold">Member</th>
                                    <th className="pb-4 font-bold">Amount</th>
                                    <th className="pb-4 font-bold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingDeposits.map((dep) => (
                                    <tr key={dep.id} className="border-b last:border-0 border-outline-variant/30">
                                        <td className="py-5">
                                            <div className="font-bold">{dep.user_name}</div>
                                            <div className="text-xs text-on-surface-variant">{dep.user_phone}</div>
                                        </td>
                                        <td className="py-5 font-black text-xl text-primary">₹{parseFloat(dep.amount).toLocaleString()}</td>
                                        <td className="py-5 text-right flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => rejectDeposit(dep.id)}
                                                className="bg-error-container text-on-error-container font-bold px-4 py-2 rounded-xl text-sm hover:opacity-80 transition-all transition-transform active:scale-95"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => approveDeposit(dep.id)}
                                                className="bg-primary text-on-primary shadow-lg shadow-primary/20 font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-all active:scale-95"
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

            {/* Pending Loans */}
            <section className="bg-surface-container-low rounded-3xl border border-outline-variant p-8 shadow-sm mt-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <span className="w-3 h-3 bg-secondary rounded-full animate-pulse shadow-lg shadow-secondary/50"></span>
                    Loan Verification
                </h2>
                {pendingLoans.length === 0 ? (
                    <div className="text-center py-10 bg-surface-container-high rounded-2xl border border-dashed border-outline-variant">
                        <p className="text-on-surface-variant italic">No pending loan requests currently.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-on-surface-variant text-xs uppercase tracking-widest border-b border-outline-variant">
                                    <th className="pb-4 font-bold">Member</th>
                                    <th className="pb-4 font-bold">Details</th>
                                    <th className="pb-4 font-bold">Amount</th>
                                    <th className="pb-4 font-bold text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingLoans.map((loan) => (
                                    <tr key={loan.id} className="border-b last:border-0 border-outline-variant/30">
                                        <td className="py-5">
                                            <div className="font-bold">{loan.user_name}</div>
                                            <div className="text-xs text-on-surface-variant">{loan.user_phone}</div>
                                        </td>
                                        <td className="py-5">
                                            <div className="text-sm font-bold">{loan.months} Months</div>
                                            <div className="text-xs text-on-surface-variant">{loan.interest_rate}% Interest</div>
                                        </td>
                                        <td className="py-5 font-black text-xl text-primary">₹{parseFloat(loan.amount).toLocaleString()}</td>
                                        <td className="py-5 text-right flex items-center justify-end gap-3">
                                            <button
                                                onClick={() => rejectLoan(loan.id)}
                                                className="bg-error-container text-on-error-container font-bold px-4 py-2 rounded-xl text-sm hover:opacity-80 transition-all active:scale-95"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => approveLoan(loan.id)}
                                                className="bg-primary text-on-primary shadow-lg font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-all active:scale-95"
                                            >
                                                Approve Loan
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
            <section className="bg-surface-container-low rounded-3xl border border-outline-variant p-8 shadow-sm">
                <h2 className="text-2xl font-bold mb-6">Community Members</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {users.map((user) => (
                        <div key={user.id} className="bg-surface-container-high p-6 rounded-2xl border border-outline-variant/50 hover:border-primary transition-all group relative overflow-hidden">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary-container text-on-primary-container flex items-center justify-center font-black text-xl">
                                    {user.name[0]}
                                </div>
                                <span className={`text-[10px] uppercase px-3 py-1 rounded-full font-black tracking-widest ${user.kyc_status === 'verified' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'
                                    }`}>
                                    {user.kyc_status}
                                </span>
                            </div>
                            <div className="mb-6">
                                <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{user.name}</h3>
                                <p className="text-sm font-medium text-on-surface-variant">{user.phone}</p>
                            </div>
                            <div className="flex justify-between items-center py-4 border-t border-outline-variant/30">
                                <div>
                                    <div className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Balance</div>
                                    <div className="text-xl font-black">₹{parseFloat(user.balance).toLocaleString()}</div>
                                </div>
                                {user.kyc_status !== 'verified' && (
                                    <button
                                        onClick={() => verifyUser(user.id)}
                                        className="bg-primary text-on-primary px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:scale-105 transition-all"
                                    >
                                        Verify
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Critical Actions */}
            <section className="bg-error-container/10 rounded-3xl border border-error/20 p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div>
                        <h2 className="text-2xl font-bold text-error flex items-center gap-2">
                            <span className="material-symbols-outlined">warning</span>
                            Critical Maintenance
                        </h2>
                        <p className="text-on-error-container/70 mt-1">Danger zone: Permanent actions for system cleanup.</p>
                    </div>
                    <button
                        onClick={wipeSystem}
                        className="bg-error text-on-error px-8 py-4 rounded-2xl font-black shadow-xl shadow-error/20 hover:bg-error/90 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">delete_forever</span>
                        Wipe Total System
                    </button>
                </div>
            </section>
        </div>
    );
};

export default Admin;
