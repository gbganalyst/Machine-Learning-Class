import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { LogIn, Loader2 } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            onLoginSuccess();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container container">
            <div className="login-card glass">
                <h1>Admin Access</h1>
                <p>Welcome back. Please enter your details.</p>
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            required
                            placeholder="admin@auraluxe.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn-primary login-btn" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <LogIn size={18} />}
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>

            <style>{`
                .login-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 70vh;
                }
                .login-card {
                    width: 100%;
                    max-width: 400px;
                    padding: 50px 40px;
                    border-radius: 4px;
                }
                .login-card h1 {
                    font-size: 2rem;
                    margin-bottom: 10px;
                    text-align: center;
                }
                .login-card p {
                    text-align: center;
                    color: var(--text-light);
                    margin-bottom: 30px;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                .form-group label {
                    display: block;
                    font-size: 0.9rem;
                    margin-bottom: 8px;
                    font-weight: 500;
                }
                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border: 1px solid #ddd;
                    border-radius: 0;
                    font-family: 'Outfit', sans-serif;
                }
                .form-group input:focus {
                    border-color: var(--primary);
                    outline: none;
                }
                
                .login-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    margin-top: 10px;
                }

                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Login;
