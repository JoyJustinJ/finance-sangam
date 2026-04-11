import React, { useState, useEffect } from 'react';
import { getDeposits, submitDeposit, getLoans, submitLoan } from '../api';
import { toast } from 'react-hot-toast';

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

export default function DepositBorrow() {
    const [activeTab, setActiveTab] = useState('deposit');
    const [depositData, setDepositData] = useState(null);
    const [loanData, setLoanData] = useState(null);
    const [loadingDeposit, setLoadingDeposit] = useState(true);
    const [loadingLoan, setLoadingLoan] = useState(true);

    // Deposit form
    const [depositAmount, setDepositAmount] = useState('');
    const [depositMethod, setDepositMethod] = useState('UPI');
    const [depositLoading, setDepositLoading] = useState(false);
    const [depositSuccess, setDepositSuccess] = useState('');
    const [depositError, setDepositError] = useState('');

    // Loan form
    const [loanAmount, setLoanAmount] = useState('');
    const [loanMonths, setLoanMonths] = useState(12);
    const [loanLoading, setLoanLoading] = useState(false);
    const [loanSuccess, setLoanSuccess] = useState('');
    const [loanError, setLoanError] = useState('');
    const [emi, setEmi] = useState(0);

    useEffect(() => {
        getDeposits().then(r => setDepositData(r.data)).finally(() => setLoadingDeposit(false));
        getLoans().then(r => setLoanData(r.data)).finally(() => setLoadingLoan(false));
    }, []);

    // Calculate EMI preview
    useEffect(() => {
        if (!loanAmount || !loanMonths) return;
        const rate = 8.5 / 12 / 100;
        const n = parseInt(loanMonths);
        const p = parseFloat(loanAmount);
        if (p > 0 && n > 0) {
            const calcEmi = (p * rate * Math.pow(1 + rate, n)) / (Math.pow(1 + rate, n) - 1);
            setEmi(Math.round(calcEmi));
        }
    }, [loanAmount, loanMonths]);

    const handleDeposit = async (e) => {
        e.preventDefault();
        setDepositError(''); setDepositSuccess('');
        setDepositLoading(true);
        try {
            const res = await submitDeposit(parseFloat(depositAmount), depositMethod);
            toast.success(`Deposit request submitted!`);
            setDepositSuccess(`✅ Success! Your request for ${fmt(depositAmount)} is awaiting admin approval.`);
            setDepositAmount('');
        } catch (err) {
            const msg = err.response?.data?.error || 'Deposit failed';
            setDepositError(msg);
            toast.error(msg);
        } finally {
            setDepositLoading(false);
        }
    };

    const handleLoan = async (e) => {
        e.preventDefault();
        setLoanError(''); setLoanSuccess('');
        setLoanLoading(true);
        try {
            const res = await submitLoan(parseFloat(loanAmount), loanMonths);
            toast.success(`Loan of ${fmt(loanAmount)} approved!`);
            setLoanSuccess(`✅ Approved! EMI: ${fmt(res.data.monthly_installment)}/month.`);
            setLoanAmount('');
        } catch (err) {
            const msg = err.response?.data?.error || 'Loan request failed';
            setLoanError(msg);
            toast.error(msg);
        } finally {
            setLoanLoading(false);
        }
    };

    return (
        <>
            <section className="mt-8 mb-10 max-w-lg mx-auto">
                <h2 className="text-4xl font-headline font-extrabold text-primary leading-tight tracking-tighter">
                    Manage Your <br /><span className="text-on-primary-container">Capital.</span>
                </h2>
                <p className="text-on-surface-variant mt-2 leading-relaxed">Secure and community-backed financial growth.</p>
            </section>

            {/* Trust Meter */}
            <div className="max-w-lg mx-auto mb-10 p-6 bg-surface-container-lowest rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-4">
                <div className="flex-1">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Trust Score</span>
                        <span className="text-sm font-headline font-bold text-secondary">{loanData?.trust_score || 0} / 1000</span>
                    </div>
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-secondary to-primary rounded-full" style={{ width: `${((loanData?.trust_score || 0) / 1000) * 100}%` }}></div>
                    </div>
                </div>
                <div className="bg-secondary-container p-2 rounded-full">
                    <span className="material-symbols-outlined text-on-secondary-container text-lg">verified</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-lg mx-auto flex gap-4 mb-8">
                <button onClick={() => setActiveTab('deposit')}
                    className={`px-8 py-3 font-headline font-bold rounded-full transition-all ${activeTab === 'deposit' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}>
                    Deposit
                </button>
                <button onClick={() => setActiveTab('borrow')}
                    className={`px-8 py-3 font-headline font-semibold rounded-full transition-all ${activeTab === 'borrow' ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low'}`}>
                    Borrow
                </button>
            </div>

            <div className="max-w-lg mx-auto">
                {activeTab === 'deposit' && (
                    <form className="space-y-6" onSubmit={handleDeposit}>
                        {!loadingDeposit && (
                            <div className="bg-surface-container-low p-8 rounded-xl">
                                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Available Balance</p>
                                <h3 className="text-3xl font-headline font-extrabold text-primary">{fmt(depositData?.available_balance)}</h3>
                            </div>
                        )}

                        {depositSuccess && <div className="p-4 bg-secondary-container rounded-xl text-on-secondary-container text-sm font-medium">{depositSuccess}</div>}
                        {depositError && <div className="p-4 bg-error-container/30 rounded-xl text-on-error-container text-sm font-medium">{depositError}</div>}

                        <div>
                            <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 ml-1">DEPOSIT AMOUNT</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                                <input value={depositAmount} onChange={e => setDepositAmount(e.target.value)}
                                    className="w-full bg-surface-container-high border-none rounded-md py-4 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 text-lg font-headline font-bold placeholder:text-on-surface-variant/30 transition-all outline-none"
                                    placeholder="0.00" type="number" min="1" required />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {['GPay', 'UPI'].map(method => (
                                <button key={method} type="button" onClick={() => setDepositMethod(method)}
                                    className={`p-4 rounded-md flex items-center justify-center gap-3 active:scale-95 transition-all ${depositMethod === method ? 'bg-primary text-on-primary shadow-md' : 'bg-surface-container-lowest hover:bg-surface-container-low'}`}>
                                    <span className={`material-symbols-outlined ${depositMethod === method ? 'text-on-primary' : 'text-primary'}`}>
                                        {method === 'GPay' ? 'g_mobiledata' : 'account_balance'}
                                    </span>
                                    <span className={`font-bold text-sm ${depositMethod === method ? 'text-on-primary' : 'text-on-surface'}`}>{method}</span>
                                </button>
                            ))}
                        </div>

                        <button type="submit" disabled={depositLoading}
                            className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-5 rounded-md font-headline font-extrabold text-lg shadow-lg active:scale-95 hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {depositLoading ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>Processing...</> : 'Confirm Deposit'}
                        </button>
                    </form>
                )}

                {activeTab === 'borrow' && (
                    <form className="space-y-6" onSubmit={handleLoan}>
                        <div className="bg-surface-container-low p-8 rounded-xl">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">Max Eligibility</p>
                                    <h3 className="text-3xl font-headline font-extrabold text-primary">{fmt(loanData?.max_eligibility || 0)}</h3>
                                </div>
                                <span className="bg-tertiary-fixed-dim text-on-tertiary-fixed-variant text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider">Premium Member</span>
                            </div>
                            <div className="grid grid-cols-2 gap-8 border-t border-outline-variant/20 pt-6">
                                <div>
                                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Interest Rate</p>
                                    <p className="text-lg font-headline font-extrabold text-secondary">{loanData?.interest_rate || 8.5}% p.a.</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Repayment</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <select value={loanMonths} onChange={e => setLoanMonths(parseInt(e.target.value))}
                                            className="bg-surface-container-high rounded-md px-2 py-1 text-sm font-bold text-primary outline-none">
                                            {[6, 12, 18, 24, 36].map(m => <option key={m} value={m}>{m} Months</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loanSuccess && <div className="p-4 bg-secondary-container rounded-xl text-on-secondary-container text-sm font-medium">{loanSuccess}</div>}
                        {loanError && <div className="p-4 bg-error-container/30 rounded-xl text-on-error-container text-sm font-medium">{loanError}</div>}

                        <div>
                            <label className="block text-[11px] font-semibold text-on-surface-variant mb-2 ml-1">LOAN AMOUNT</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
                                <input value={loanAmount} onChange={e => setLoanAmount(e.target.value)}
                                    className="w-full bg-surface-container-high border-none rounded-md py-4 pl-8 pr-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg font-headline font-bold"
                                    placeholder="Enter amount to borrow" type="number" min="1000" required />
                            </div>
                        </div>

                        {emi > 0 && (
                            <div className="bg-surface-container-lowest p-6 rounded-xl space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-on-surface-variant font-medium">Monthly Installment</span>
                                    <span className="font-headline font-bold text-primary">{fmt(emi)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-on-surface-variant font-medium">Processing Fee (2%)</span>
                                    <span className="font-headline font-bold text-primary">{fmt(Math.round(parseFloat(loanAmount) * 0.02))}</span>
                                </div>
                            </div>
                        )}

                        <button type="submit" disabled={loanLoading}
                            className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-5 rounded-md font-headline font-extrabold text-lg shadow-lg active:scale-95 hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {loanLoading ? <><span className="material-symbols-outlined animate-spin">progress_activity</span>Processing...</> : 'Request Loan'}
                        </button>
                    </form>
                )}

                {activeTab === 'borrow' && loanData?.loans?.filter(l => l.status === 'ACTIVE').length > 0 && (
                    <div className="mt-8 space-y-4">
                        <h3 className="text-xl font-headline font-bold text-primary">Active Loans</h3>
                        {loanData.loans.filter(l => l.status === 'ACTIVE').map(loan => (
                            <div key={loan.id} className="bg-surface-container-low p-6 rounded-xl flex flex-col gap-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-on-surface">Loan Amount: {fmt(loan.amount)}</p>
                                        <p className="text-xs text-on-surface-variant">{loan.months} months remaining</p>
                                    </div>
                                    <span className="font-headline font-bold text-secondary">{fmt(loan.monthly_installment)} / mo</span>
                                </div>
                                <button
                                    onClick={async (e) => {
                                        e.preventDefault();
                                        const btn = e.currentTarget;
                                        btn.disabled = true;
                                        btn.innerHTML = 'Processing...';
                                        try {
                                            const { repayLoan, getLoans, getDeposits } = await import('../api');
                                            await repayLoan(loan.id);
                                            toast.success('EMI Repaid Successfully!');
                                            const lData = await getLoans();
                                            const dData = await getDeposits();
                                            if (setLoanData) setLoanData(lData.data);
                                            if (setDepositData) setDepositData(dData.data);
                                        } catch (err) {
                                            toast.error(err.response?.data?.error || 'Repayment failed');
                                        } finally {
                                            btn.disabled = false;
                                            btn.innerHTML = 'Repay EMI';
                                        }
                                    }}
                                    className="w-full py-3 bg-secondary-container text-on-secondary-container font-bold rounded-lg shadow-sm active:scale-95 transition-all">
                                    Repay EMI
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 p-6 bg-surface-variant/40 backdrop-blur-md rounded-full border border-white/10 flex items-center gap-4">
                    <div className="w-10 h-10 flex-shrink-0 bg-secondary rounded-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-on-secondary">group</span>
                    </div>
                    <p className="text-xs text-on-surface-variant">
                        Secure and community-backed capital for your future.
                    </p>
                </div>
            </div>
        </>
    );
}
