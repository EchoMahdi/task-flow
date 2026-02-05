import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle, Lock } from 'lucide-react';

const PasswordRecoveryForm = ({ onBack }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset link');
            }

            setSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="auth-form recovery-form">
                <div className="form-header">
                    <CheckCircle className="header-icon success" />
                    <h2>Check Your Email</h2>
                    <p>We've sent password reset instructions to {email}</p>
                </div>

                <div className="success-message">
                    <p>Please check your email and follow the link to reset your password.</p>
                    <p className="hint">If you don't receive an email within a few minutes, check your spam folder.</p>
                </div>

                <button
                    type="button"
                    className="back-btn"
                    onClick={onBack}
                >
                    <ArrowLeft size={18} />
                    Back to Login
                </button>
            </div>
        );
    }

    return (
        <div className="auth-form recovery-form">
            <div className="form-header">
                <Lock className="header-icon" />
                <h2>Forgot Password?</h2>
                <p>Enter your email to receive reset instructions</p>
            </div>

            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                        <Mail className="input-icon" />
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            disabled={loading}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="submit-btn"
                    disabled={loading}
                >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>

            <button
                type="button"
                className="back-btn"
                onClick={onBack}
            >
                <ArrowLeft size={18} />
                Back to Login
            </button>
        </div>
    );
};

export default PasswordRecoveryForm;
