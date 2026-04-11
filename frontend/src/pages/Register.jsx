import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', phone: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await axios.post(`${API_URL}/auth/register`, formData);
            toast.success('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            const msg = err.response?.data?.error || 'Registration failed.';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center p-6 md:p-12 bg-surface">
            <div className="max-w-md w-full bg-surface-container-lowest p-8 md:p-12 rounded-3xl shadow-2xl border border-outline-variant/10">
                <div className="mb-8 text-center">
                    <h2 className="font-headline text-3xl font-bold text-on-surface mb-2">Join Sangam</h2>
                    <p className="text-on-surface-variant">Start your community finance journey.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-error-container/30 border border-error/20 rounded-xl text-on-error-container text-sm font-medium flex items-center gap-2">
                        <span className="material-symbols-outlined text-error text-lg">error</span>
                        {error}
                    </div>
                )}

                <form className="space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-on-surface-variant ml-1">Full Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-4 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-on-surface-variant ml-1">Phone Number</label>
                        <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full px-4 py-4 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                            placeholder="98765 43210"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-on-surface-variant ml-1">Password</label>
                        <input
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="w-full px-4 py-4 bg-surface-container-high rounded-md border-none focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-outline-variant"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 rounded-md bg-primary text-on-primary font-bold text-lg shadow-xl active:scale-[0.98] transition-transform disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-outline-variant/10 text-center">
                    <p className="text-on-surface-variant text-sm">
                        Already have an account?{' '}
                        <Link to="/login" className="font-bold text-primary hover:underline">Login</Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
