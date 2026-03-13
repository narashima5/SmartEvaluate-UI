import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { domains } from '../data/mockData';

const domainToUsernameMap: Record<string, string> = {
    'Healthcare Technology': 'healthcare',
    'AI / Generative AI': 'genai',
    'Open Innovation': 'open',
    'Cybersecurity': 'cybersecurity',
    'Disaster Prediction & Response': 'disaster',
    'Climate & Environmental Intelligence': 'evs',
    'IoT & Smart Cities': 'iot'
};

export default function Login() {
    const [domain, setDomain] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ domain, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed. Please check your credentials.');
            }

            // Successful login, save to context (which saves to localStorage)
            login(data.token, data.user);

            // Redirect to the participants log board
            navigate('/participants', { replace: true });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] flex items-center justify-center p-4">
            {/* Background glowing effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8 animate-in slide-in-from-bottom-4 duration-500">
                    <h1 className="text-4xl font-display font-bold text-white mb-2">Smart Evaluate</h1>
                    <p className="text-slate-400">Sign in to the evaluation dashboard.</p>
                </div>

                <div className="bg-[#1C1C1E]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-500 delay-150">
                    {error && (
                        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-400 animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Domain Account</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                                    <User className="w-5 h-5" />
                                </div>
                                <select
                                    value={domain}
                                    onChange={(e) => setDomain(e.target.value)}
                                    className="w-full bg-[#2C2C2E]/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none transition-all"
                                    required
                                >
                                    <option value="" disabled className="text-slate-500">Select your domain account</option>
                                    <option value="admin" className="bg-[#1C1C1E] text-white font-semibold">Admin (All Access)</option>
                                    {domains.map(d => (
                                        <option key={d} value={domainToUsernameMap[d]} className="bg-[#1C1C1E] text-white">{d}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-purple-400 transition-colors">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-[#2C2C2E]/50 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium py-4 rounded-2xl transition-all shadow-lg hover:shadow-purple-500/25 active:scale-[0.98] flex items-center justify-center gap-2 mt-2 disabled:opacity-70 disabled:pointer-events-none"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
