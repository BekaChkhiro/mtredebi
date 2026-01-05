'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Phone, KeyRound, AlertCircle } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, isAuthenticated, isInitialized, initialize } = useAuthStore();

  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isInitialized, isAuthenticated, router]);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    if (formatted.replace(/\s/g, '').length <= 9) {
      setPhone(formatted);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const phoneDigits = phone.replace(/\s/g, '');
    if (phoneDigits.length !== 9) {
      setError('ტელეფონის ნომერი უნდა იყოს 9 ციფრი');
      setLoading(false);
      return;
    }

    try {
      const fullPhone = `+995${phoneDigits}`;
      await authApi.sendOtp(fullPhone);
      setStep('otp');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'შეცდომა მოხდა');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (otp.length !== 4) {
      setError('კოდი უნდა იყოს 4 ციფრი');
      setLoading(false);
      return;
    }

    try {
      const fullPhone = `+995${phone.replace(/\s/g, '')}`;
      const response = await authApi.verifyOtp(fullPhone, otp);
      const { token, user } = response.data.data;

      if (user.role !== 'ADMIN') {
        setError('მხოლოდ ადმინისტრატორებისთვის');
        setLoading(false);
        return;
      }

      setAuth(token, user);
      router.replace('/dashboard');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'შეცდომა მოხდა');
    } finally {
      setLoading(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-800 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">მტრედები</h1>
          <p className="text-gray-500 mt-1">ადმინისტრატორის პანელი</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ტელეფონის ნომერი
            </label>
            <div className="relative mb-6">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-500">
                <Phone className="w-5 h-5" />
                <span>+995</span>
              </div>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="555 123 456"
                className="w-full pl-24 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || phone.replace(/\s/g, '').length !== 9}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'იგზავნება...' : 'კოდის გაგზავნა'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="text-center mb-6">
              <p className="text-gray-600">
                კოდი გამოგზავნილია ნომერზე
              </p>
              <p className="font-semibold text-gray-900">+995 {phone}</p>
              <button
                type="button"
                onClick={() => {
                  setStep('phone');
                  setOtp('');
                  setError('');
                }}
                className="text-primary-600 text-sm mt-1 hover:underline"
              >
                ნომრის შეცვლა
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              ვერიფიკაციის კოდი
            </label>
            <div className="relative mb-6">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 4) setOtp(value);
                }}
                placeholder="0000"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg text-center tracking-widest"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || otp.length !== 4}
              className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'მოწმდება...' : 'შესვლა'}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              DEV რეჟიმში კოდი არის console-ში
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
