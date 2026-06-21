'use client';

import { useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

/**
 * PasswordResetTrigger - Triggers Clerk password reset flow
 * 
 * Displays success/error messages after triggering the password reset.
 * 
 * Requirements: 1.7
 * 
 * @example
 * ```tsx
 * <PasswordResetTrigger email="user@example.com" />
 * ```
 */
export function PasswordResetTrigger({ email }: { email?: string }) {
  const { client } = useClerk();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handlePasswordReset = async () => {
    if (!email) {
      setStatus('error');
      setMessage('Email address is required');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      await client?.signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });

      setStatus('success');
      setMessage('Password reset email sent! Check your inbox.');
    } catch (error: any) {
      setStatus('error');
      setMessage(error?.errors?.[0]?.message || 'Failed to send password reset email');
    }
  };

  return (
    <div className="space-y-2">
      <Button
        onClick={handlePasswordReset}
        disabled={status === 'loading'}
        variant="outline"
        className="w-full"
      >
        {status === 'loading' ? 'Sending...' : 'Reset Password'}
      </Button>
      
      {status === 'success' && (
        <p className="text-sm text-green-500">{message}</p>
      )}
      
      {status === 'error' && (
        <p className="text-sm text-red-500">{message}</p>
      )}
    </div>
  );
}
