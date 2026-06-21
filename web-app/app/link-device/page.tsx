'use client';

import { useState, useCallback } from 'react';
import { Tv, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function LinkDevicePage() {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanCode = code.replace(/\D/g, '').slice(0, 6);
    if (cleanCode.length !== 6) {
      setStatus('error');
      setMessage('Please enter a valid 6-digit code');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch('/api/device-auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus('success');
        setMessage('Device linked successfully! You can now use Rusil Stream on your TV.');
        setCode('');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to link device. Check the code and try again.');
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  }, [code]);

  const handleCodeChange = (value: string) => {
    // Only allow digits, max 6
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setCode(digits);
    if (status === 'error') setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 px-8 py-5 border-b border-white/10">
        <h1 className="text-xl font-bold">Rusil Stream</h1>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-red-600/15 flex items-center justify-center mb-5">
              <Tv size={32} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Link a Device</h2>
            <p className="text-white/50 text-center text-sm leading-relaxed">
              Enter the 6-digit code shown on your TV screen to link it to your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                placeholder="000000"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-5 py-4 text-center text-3xl font-mono tracking-[0.4em] text-white placeholder-white/20 focus:outline-none focus:border-white/40 focus:bg-white/8 transition-colors"
                autoFocus
                disabled={status === 'loading'}
              />
            </div>

            <button
              type="submit"
              disabled={code.length !== 6 || status === 'loading'}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-white/10 disabled:text-white/30 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Linking...
                </>
              ) : (
                'Link Device'
              )}
            </button>
          </form>

          {/* Status message */}
          {status === 'success' && (
            <div className="mt-5 flex items-start gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <CheckCircle size={20} className="text-green-400 mt-0.5 shrink-0" />
              <p className="text-green-300 text-sm">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-5 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <XCircle size={20} className="text-red-400 mt-0.5 shrink-0" />
              <p className="text-red-300 text-sm">{message}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
