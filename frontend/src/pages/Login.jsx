import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';

export default function Login() {
    const navigate = useNavigate();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await login(phone, password);
            localStorage.setItem('fs_token', res.data.token);
            localStorage.setItem('fs_user', JSON.stringify(res.data.user));
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.');
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
                            <h3 className="font-headline font-bold text-primary text-2xl">4.8/5</h3>
                            <p className="text-sm text-on-surface-variant font-medium">Community Rating</p>
                        </div>
                        <div className="p-6 rounded-[2rem] bg-tertiary-fixed text-tertiary space-y-2">
                            <h3 className="font-headline font-bold text-2xl">100k+</h3>
                            <p className="text-sm font-medium opacity-80">Trusted Members</p>
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

                {/* Login Form */}
                <div className="bg-surface-container-lowest p-8 md:p-12 rounded-3xl shadow-[0_40px_80px_rgba(25,28,29,0.06)] border border-outline-variant/10">
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
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">phone</span>
                                <input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                                    placeholder="98765 43210"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="block text-sm font-medium text-on-surface-variant" htmlFor="password">Password</label>
                                <a className="text-sm font-medium text-primary hover:underline underline-offset-4" href="#">Forgot Password?</a>
                            </div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline">lock</span>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-12 py-4 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline hover:text-primary transition-colors"
                                >
                                    {showPassword ? 'visibility_off' : 'visibility'}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-md bg-gradient-to-r from-primary to-primary-container text-on-primary font-bold text-lg shadow-xl active:scale-[0.98] transition-transform disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
                                    Logging in...
                                </>
                            ) : 'Login'}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-outline-variant/10 text-center">
                        <p className="text-on-surface-variant text-sm">
                            New to Sangam?{' '}
                            <span className="font-bold text-primary cursor-pointer hover:opacity-80">Sign Up</span>
                        </p>
                    </div>
                    <div className="mt-6 flex justify-center items-center gap-4 opacity-50">
                        <div className="h-[1px] w-12 bg-outline-variant"></div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-outline">PCI-DSS Compliant</span>
                        <div className="h-[1px] w-12 bg-outline-variant"></div>
                    </div>
                </div>
            </div>
        </main>
    );
}
