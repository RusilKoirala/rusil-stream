'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PinEntryProps {
  profileId: string;
  onSuccess: () => void;
  onCancel?: () => void;
}

/**
 * PinEntry Component
 * 
 * Displays 4-digit PIN input with masked characters.
 * Calls POST /api/profiles/:id/verify-pin on submit.
 * Shows error message for invalid PIN.
 * 
 * Requirements: 2.8
 */
export function PinEntry({ profileId, onSuccess, onCancel }: PinEntryProps) {
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    setError(null);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits are entered
    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value].join('');
      verifyPin(fullPin);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyPin = async (pinValue: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/profiles/${profileId}/verify-pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: pinValue }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to verify PIN');
      }

      const data = await response.json();

      if (data.valid) {
        onSuccess();
      } else {
        setError('Invalid PIN. Please try again.');
        setPin(['', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setPin(['', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    const fullPin = pin.join('');
    if (fullPin.length === 4) {
      verifyPin(fullPin);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-[#181818] rounded-lg">
      <h2 className="text-white text-2xl font-bold">Enter PIN</h2>

      <div className="flex gap-4">
        {pin.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={loading}
            className={cn(
              'w-16 h-16 text-center text-2xl font-bold',
              'bg-[#232323] border-[#2F2F2F] text-white',
              'focus:border-white focus:ring-white'
            )}
          />
        ))}
      </div>

      {error && (
        <p className="text-[#E50914] text-sm">{error}</p>
      )}

      <div className="flex gap-4">
        {onCancel && (
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="text-[#B3B3B3] border-[#B3B3B3] hover:text-white hover:border-white"
          >
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={loading || pin.join('').length !== 4}
          className="bg-[#E50914] hover:bg-[#E50914]/80 text-white"
        >
          {loading ? 'Verifying...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
}
