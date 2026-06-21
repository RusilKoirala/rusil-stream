'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ProfileFormData {
  name: string;
  avatarUrl: string;
  maturityRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  pinEnabled: boolean;
  language: string;
}

interface ProfileFormProps {
  initialData?: Partial<ProfileFormData>;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

// Preset avatar images
const AVATAR_OPTIONS = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.jpeg',
  '/avatars/avatar3.png',
  '/avatars/avatar4.png',
];

/**
 * ProfileForm Component
 * 
 * Input fields for name, avatar selection, maturity rating, PIN toggle, language.
 * Avatar selection grid with preset images.
 * Validates name length (1-50 chars) and maturity rating enum.
 * 
 * Requirements: 2.5, 2.6, 2.7
 */
export function ProfileForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
}: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: initialData?.name || '',
    avatarUrl: initialData?.avatarUrl || AVATAR_OPTIONS[0],
    maturityRating: initialData?.maturityRating || 'PG-13',
    pinEnabled: initialData?.pinEnabled || false,
    language: initialData?.language || 'en',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!formData.name || formData.name.trim().length === 0) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Name must be 50 characters or less';
    }

    if (!formData.avatarUrl) {
      newErrors.avatarUrl = 'Please select an avatar';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Name Input */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white">
          Name
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter profile name"
          maxLength={50}
          className={cn(
            'bg-[#232323] border-[#2F2F2F] text-white',
            errors.name && 'border-[#E50914]'
          )}
        />
        {errors.name && (
          <p className="text-[#E50914] text-sm">{errors.name}</p>
        )}
      </div>

      {/* Avatar Selection */}
      <div className="space-y-2">
        <Label className="text-white">Avatar</Label>
        <div className="grid grid-cols-4 gap-4">
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar}
              type="button"
              onClick={() => setFormData({ ...formData, avatarUrl: avatar })}
              className={cn(
                'w-20 h-20 rounded-full overflow-hidden border-4 transition-all',
                formData.avatarUrl === avatar
                  ? 'border-white scale-110'
                  : 'border-transparent hover:border-[#B3B3B3]'
              )}
            >
              <Image
                src={avatar}
                alt="Avatar option"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Maturity Rating */}
      <div className="space-y-2">
        <Label htmlFor="maturityRating" className="text-white">
          Maturity Rating
        </Label>
        <select
          id="maturityRating"
          value={formData.maturityRating}
          onChange={(e) =>
            setFormData({
              ...formData,
              maturityRating: e.target.value as ProfileFormData['maturityRating'],
            })
          }
          className="w-full h-10 px-3 rounded-lg bg-[#232323] border border-[#2F2F2F] text-white"
        >
          <option value="G">G - General Audiences</option>
          <option value="PG">PG - Parental Guidance</option>
          <option value="PG-13">PG-13 - Parents Strongly Cautioned</option>
          <option value="R">R - Restricted</option>
          <option value="NC-17">NC-17 - Adults Only</option>
        </select>
      </div>

      {/* Language */}
      <div className="space-y-2">
        <Label htmlFor="language" className="text-white">
          Language
        </Label>
        <select
          id="language"
          value={formData.language}
          onChange={(e) => setFormData({ ...formData, language: e.target.value })}
          className="w-full h-10 px-3 rounded-lg bg-[#232323] border border-[#2F2F2F] text-white"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="it">Italian</option>
          <option value="pt">Portuguese</option>
          <option value="ja">Japanese</option>
          <option value="ko">Korean</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      {/* PIN Protection */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="pinEnabled" className="text-white">
            PIN Protection
          </Label>
          <p className="text-[#B3B3B3] text-sm">
            Require a PIN to access this profile
          </p>
        </div>
        <Switch
          id="pinEnabled"
          checked={formData.pinEnabled}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, pinEnabled: checked })
          }
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 pt-4">
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#E50914] hover:bg-[#E50914]/80 text-white"
        >
          {loading ? 'Saving...' : submitLabel}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="text-[#B3B3B3] border-[#B3B3B3] hover:text-white hover:border-white"
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
