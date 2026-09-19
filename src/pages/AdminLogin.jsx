import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, KeyRound, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { adminLogin, requestLoginOtp, verifyLoginOtp } from '../services/adminService';
import { toast } from '../components/Toast';

export default function AdminLogin() {
  const [mode, setMode] = useState('password'); // 'password' | 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await adminLogin({ email, password });
      localStorage.setItem('admin_token', res.token);
      localStorage.setItem('admin_user', JSON.stringify({ name: 'Super Admin', email }));
      toast.success('Welcome back, Administrator!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter admin email');
    setLoading(true);
    try {
      const res = await requestLoginOtp(email);
      setOtpSent(true);
      toast.success(res.msg || 'OTP sent to your email!');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to dispatch OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the 6-digit OTP code');
    setLoading(true);
    try {
      const res = await verifyLoginOtp({ email, otp });
      localStorage.setItem('admin_token', res.token);
      localStorage.setItem('admin_user', JSON.stringify(res.admin));
      toast.success('OTP verified! Welcome to the Admin Portal.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--admin-bg)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px', background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border)', borderRadius: '16px', padding: '36px', boxShadow: 'var(--admin-shadow)' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#fff', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--admin-text-main)', margin: '0 0 4px 0' }}>Admin Portal Access</h2>
          <p style={{ fontSize: '13px', color: 'var(--admin-text-sub)', margin: 0 }}>Sign in to manage the multi-vendor commerce ecosystem</p>
        </div>

        {/* Mode Switcher Tabs */}
        <div style={{ display: 'flex', background: 'var(--admin-surface)', padding: '4px', borderRadius: '10px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => setMode('password')}
            style={{ flex: 1, padding: '8px', border: 'none', background: mode === 'password' ? 'var(--admin-card-bg)' : 'transparent', color: mode === 'password' ? 'var(--admin-primary)' : 'var(--admin-text-muted)', fontWeight: 700, fontSize: '13px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => setMode('otp')}
            style={{ flex: 1, padding: '8px', border: 'none', background: mode === 'otp' ? 'var(--admin-card-bg)' : 'transparent', color: mode === 'otp' ? 'var(--admin-primary)' : 'var(--admin-text-muted)', fontWeight: 700, fontSize: '13px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s ease' }}
          >
            Email OTP Login
          </button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '6px' }}>Admin Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-sub)' }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@company.com"
                  className="admin-search-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '6px' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-sub)' }} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter admin password"
                  className="admin-search-input"
                  style={{ paddingLeft: '38px' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="admin-btn admin-btn-primary"
              style={{ width: '100%', height: '42px', marginTop: '8px', fontSize: '14px' }}
            >
              {loading ? 'Authenticating...' : 'Sign In as Administrator'}
            </button>
          </form>
        ) : (
          <div>
            {!otpSent ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '6px' }}>Admin Registered Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-sub)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@company.com"
                      className="admin-search-input"
                      style={{ paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="admin-btn admin-btn-primary"
                  style={{ width: '100%', height: '42px', fontSize: '14px' }}
                >
                  {loading ? 'Sending OTP...' : 'Send Verification OTP to Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid var(--admin-success)', borderRadius: '8px', fontSize: '12.5px', color: 'var(--admin-success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle2 size={16} />
                  <span>OTP code sent to <strong>{email}</strong></span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--admin-text-muted)', marginBottom: '6px' }}>Enter 6-digit Code</label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-sub)' }} />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="e.g. 849201"
                      className="admin-search-input"
                      style={{ paddingLeft: '38px', letterSpacing: '0.2em', fontWeight: 700, fontSize: '16px' }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="admin-btn admin-btn-primary"
                  style={{ width: '100%', height: '42px', fontSize: '14px' }}
                >
                  {loading ? 'Verifying...' : 'Verify OTP & Enter Portal'}
                </button>

                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--admin-text-sub)', fontSize: '12.5px', cursor: 'pointer', textAlign: 'center' }}
                >
                  &larr; Resend code or change email
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

