import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Login() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 2FA state
    const [twoFactorRequired, setTwoFactorRequired] = useState(false);
    const [twoFactorPhone, setTwoFactorPhone] = useState('');
    const [tempToken, setTempToken] = useState('');
    const [otp, setOtp] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(phone, password);
            if (res.data.two_factor_required) {
                setTwoFactorRequired(true);
                setTwoFactorPhone(res.data.phone);
                setTempToken(res.data.temp_token);
                toast('2FA required — enter your verification code', { icon: '🛡️' });
            } else {
                localStorage.setItem('fs_token', res.data.token);
                localStorage.setItem('fs_user', JSON.stringify(res.data.user));
                navigate('/');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify2FA = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/auth/verify-2fa`, {
                phone: twoFactorPhone,
                code: otp,
                temp_token: tempToken,
            });
            localStorage.setItem('fs_token', res.data.token);
            localStorage.setItem('fs_user', JSON.stringify(res.data.user));
            toast.success('Verified! Welcome back.');
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6 md:p-12 bg-surface">
            <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Branding */}
                <div className="space-y-8 lg:pr-16">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-sm font-medium">
                            <span className="material-symbols-outlined text-sm">verified_user</span>
                            Member-Driven Finance
                        </div>
                        <h1 className="font-headline text-5xl md:text-6xl font-extrabold tracking-tight text-primary leading-tight">
                            Finance Sangam
                        </h1>
                        <p className="font-body text-xl text-on-surface-variant max-w-md leading-relaxed">
                            Secure community-based saving and borrowing. Curating wealth through trust and collective growth.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 rounded-[2rem] bg-surface-container-low space-y-2">
                            <h3 className="font-headline font-bold text-primary text-2xl">Secure</h3>
                            <p className="text-sm text-on-surface-variant font-medium">End-to-End Encrypted</p>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-tertiary-fixed text-tertiary space-y-2">
                            <h3 className="font-headline font-bold text-2xl">Real</h3>
                            <p className="text-sm font-medium opacity-80">100% Live Data</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { icon: 'group', title: 'Collective Savings', desc: 'Join verified local circles with higher returns than banks.' },
                            { icon: 'speed', title: 'Instant Credit', desc: 'Access emergency funds with minimal paperwork.' },
                            { icon: 'shield', title: 'Heritage Security', desc: 'Community trust + state-of-the-art encryption.' }
                        ].map((f, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 bg-surface-container-low rounded-2xl">
                                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-on-secondary-container text-sm">{f.icon}</span>
                                </div>
                                <div>
                                    <h4 className="font-headline font-bold text-primary">{f.title}</h4>
                                    <p className="text-sm text-on-surface-variant">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Login / 2FA Form */}
                <div className="bg-surface-container-lowest p-8 md:p-12 rounded-3xl shadow-[0_40px_80px_rgba(25,28,29,0.06)] border border-outline-variant/10">
                    {twoFactorRequired ? (
                        <>
                            <div className="mb-8 text-center">
                                <div className="w-16 h-16 bg-secondary-container rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-on-secondary-container text-3xl">shield</span>
                                </div>
                                <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Verification Required</h2>
                                <p className="text-on-surface-variant text-sm">Enter the 6-digit code to confirm your identity.</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-error-container/30 border border-error/20 rounded-xl text-on-error-container text-sm font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-error text-lg">error</span>
                                    {error}
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleVerify2FA}>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-on-surface-variant ml-1">6-Digit Code</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                        className="w-full text-center text-3xl tracking-[1rem] py-4 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-secondary/30 outline-none transition-all font-headline font-bold"
                                        placeholder="------"
                                        required
                                    />
                                    <p className="text-xs text-center text-on-surface-variant mt-1">Demo code: <span className="font-bold text-secondary">123456</span></p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading || otp.length < 6}
                                    className="w-full py-4 rounded-md bg-gradient-to-r from-secondary to-secondary-container text-on-secondary font-bold text-lg shadow-xl active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Verifying...' : 'Confirm Identity'}
                                </button>
                            </form>
                            <button onClick={() => { setTwoFactorRequired(false); setError(''); }} className="mt-6 w-full text-center text-sm text-on-surface-variant hover:text-primary transition-colors">
                                ← Back to Login
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Welcome Back</h2>
                                <p className="text-on-surface-variant">Continue your journey to financial stability.</p>
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-error-container/30 border border-error/20 rounded-xl text-on-error-container text-sm font-medium flex items-center gap-2">
                                    <span className="material-symbols-outlined text-error text-lg">error</span>
                                    {error}
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleLogin}>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-on-surface-variant ml-1" htmlFor="phone">Phone Number</label>
                                    <div className="relative">
                                        <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                                            className="w-full px-4 py-4 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                                            placeholder="98765 43210" required />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="block text-sm font-medium text-on-surface-variant" htmlFor="password">Password</label>
                                        <a className="text-sm font-medium text-primary hover:underline underline-offset-4" href="#">Forgot Password?</a>
                                    </div>
                                    <div className="relative">
                                        <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                                            className="w-full pl-4 pr-12 py-4 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                                            placeholder="••••••••" required />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline hover:text-primary transition-colors">
                                            {showPassword ? 'visibility_off' : 'visibility'}
                                        </button>
                                    </div>
                                </div>
                                <button type="submit" disabled={loading}
                                    className="w-full py-4 rounded-md bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg shadow-xl active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed">
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </form>

                            <div className="mt-8 pt-6 border-t border-outline-variant/10 text-center">
                                <p className="text-on-surface-variant text-sm">
                                    New to Sangam?{' '}
                                    <Link to="/register" className="font-bold text-primary cursor-pointer hover:opacity-80">Sign Up</Link>
                                </p>
                            </div>
                            <div className="mt-6 flex justify-center items-center gap-4 opacity-50">
                                <div className="h-[1px] w-12 bg-outline-variant"></div>
                                <span className="text-[10px] uppercase tracking-widest font-bold text-outline">PCI-DSS Compliant</span>
                                <div className="h-[1px] w-12 bg-outline-variant"></div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}
