import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from '../components/layout/index';
import { Button, Input, Alert, Card, CardBody } from '../components/ui/index';
import { Icons } from '../components/ui/Icons';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    if (!email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validate()) return;
    
    setLoading(true);
    
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(true);
    } catch (err) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="w-full max-w-md animate-fade-in">
          <Card className="shadow-elevated">
            <CardBody className="p-8 text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Mail className="w-8 h-8 text-success-600" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                Check your email
              </h1>
              <p className="text-secondary-500 mb-6">
                We've sent a password reset link to{' '}
                <span className="font-medium text-secondary-700">{email}</span>
              </p>
              <p className="text-sm text-secondary-500 mb-6">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => setSuccess(false)}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  try again
                </button>
              </p>
              <Link to="/login">
                <Button variant="outline" fullWidth>
                  <Icons.ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Button>
              </Link>
            </CardBody>
          </Card>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-fade-in">
        <Card className="shadow-elevated">
          <CardBody className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Key className="w-8 h-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-secondary-900 mb-2">
                Forgot your password?
              </h1>
              <p className="text-secondary-500">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <Alert
                variant="danger"
                className="mb-6"
                icon={<Icons.ExclamationCircle className="w-5 h-5" />}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="you@example.com"
                error={error}
                icon={<Icons.Mail className="w-5 h-5" />}
                autoComplete="email"
                autoFocus
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
              >
                Send reset link
              </Button>
            </form>

            {/* Back to login */}
            <div className="mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-secondary-500 hover:text-secondary-700"
              >
                <Icons.ArrowLeft className="w-4 h-4 mr-2" />
                Back to sign in
              </Link>
            </div>
          </CardBody>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
