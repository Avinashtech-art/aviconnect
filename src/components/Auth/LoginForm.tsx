import React, { useState } from 'react';
import { Phone, MessageCircle, Shield, Users } from 'lucide-react';
import { authAPI } from '../../services/api';

interface LoginFormProps {
  onLogin: (token: string, user: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'phone' | 'otp' | 'name'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authAPI.sendOTP(phone);
      setStep('otp');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOTP(phone, otp, name);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      onLogin(token, user);
    } catch (error: any) {
      if (error.response?.data?.error === 'Name is required for new users') {
        setStep('name');
      } else {
        setError(error.response?.data?.error || 'Failed to verify OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOTP(phone, otp, name);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      onLogin(token, user);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to complete registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AviConnect</h1>
          <p className="text-slate-400">Connect with your world</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
          {step === 'phone' && (
            <form onSubmit={handleSendOTP}>
              <h2 className="text-2xl font-bold text-white mb-6">Welcome Back</h2>
              <p className="text-slate-400 mb-6">Enter your phone number to get started</p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP}>
              <h2 className="text-2xl font-bold text-white mb-6">Verify OTP</h2>
              <p className="text-slate-400 mb-6">
                Enter the 6-digit code sent to {phone}
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200 text-center text-2xl tracking-widest"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 mb-4"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => setStep('phone')}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-all duration-200"
              >
                Change Phone Number
              </button>
            </form>
          )}

          {step === 'name' && (
            <form onSubmit={handleCompleteRegistration}>
              <h2 className="text-2xl font-bold text-white mb-6">Complete Setup</h2>
              <p className="text-slate-400 mb-6">
                Welcome to AviConnect! Please enter your name to get started.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                  required
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                {loading ? 'Creating Account...' : 'Complete Setup'}
              </button>
            </form>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="text-slate-400">
            <Shield size={24} className="mx-auto mb-2" />
            <p className="text-sm">Secure</p>
          </div>
          <div className="text-slate-400">
            <Users size={24} className="mx-auto mb-2" />
            <p className="text-sm">Connect</p>
          </div>
          <div className="text-slate-400">
            <MessageCircle size={24} className="mx-auto mb-2" />
            <p className="text-sm">Chat</p>
          </div>
        </div>
      </div>
    </div>
  );
};