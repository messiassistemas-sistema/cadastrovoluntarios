import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const Login: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                throw error;
            }
            // AuthContext will pick up the session change automatically
        } catch (err: any) {
            console.error(err);
            if (err.message.includes("Invalid login credentials")) {
                setError("E-mail ou senha incorretos.");
            } else {
                setError(err.message || 'Erro ao fazer login');
            }
        } finally {
            setLoading(false);
        }
    };

    const inputBaseStyle = "w-full p-4 bg-white border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 hover:border-slate-400";

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 border border-slate-100">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-user-shield text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Acesso Restrito</h3>
                    <p className="text-sm text-slate-500">Faça login para continuar</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">E-mail</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={inputBaseStyle}
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1 ml-1">Senha</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={inputBaseStyle}
                            placeholder="••••••••"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg font-medium border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-3 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
