# Profile Management Components

This directory contains all components related to profile management for the Netflix-style streaming platform.

## Components

### ProfilePicker
Full-screen profile selection interface displayed when users first access the application.

**Features:**
- Displays grid of profile avatars with names
- Fetches profiles from GET /api/profiles
- Navigates to home screen on profile selection
- Shows "Manage Profiles" button
- Styled with dark background (#141414) and Netflix layout

**Requirements:** 2.2, 2.3, 2.4

**Usage:**
```tsx
import { ProfilePicker } from '@/components/profiles';

<ProfilePicker />
```

### ProfileAvatar
Displays a circular avatar image with profile name beneath.

**Features:**
- Circular avatar with profile name
- Hover state with scale animation
- Border animation on hover/focus
- Smooth transitions

**Requirements:** 2.3

**Usage:**
```tsx
import { ProfileAvatar } from '@/components/profiles';

<ProfileAvatar
  name="John"
  avatarUrl="/avatars/avatar-1.png"
  onClick={() => handleProfileSelect('profile-id')}
/>
```

### ProfileManager
Comprehensive profile management interface for creating, editing, and deleting profiles.

**Features:**
- Grid display of existing profiles
- Edit and delete actions for each profile
- "Add Profile" button (shown when under 5 profiles)
- Create, edit, delete flows using Profile API routes
- Confirmation dialogs for destructive actions

**Requirements:** 2.4, 18.3

**Usage:**
```tsx
import { ProfileManager } from '@/components/profiles';

<ProfileManager />
```

### ProfileForm
Form component for creating and editing profiles.

**Features:**
- Name input with validation (1-50 chars)
- Avatar selection grid with preset images
- Maturity rating dropdown
- Language selection
- PIN protection toggle
- Form validation

**Requirements:** 2.5, 2.6, 2.7

**Usage:**
```tsx
import { ProfileForm } from '@/components/profiles';

<ProfileForm
  initialData={existingProfile}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
  submitLabel="Save Changes"
/>
```

### PinEntry
4-digit PIN entry component for profile protection.

**Features:**
- 4 separate masked input fields
- Auto-focus next input on digit entry
- Auto-submit when all 4 digits entered
- Calls POST /api/profiles/:id/verify-pin
- Error message display for invalid PIN
- Backspace navigation between inputs

**Requirements:** 2.8

**Usage:**
```tsx
import { PinEntry } from '@/components/profiles';

<PinEntry
  profileId="profile-id"
  onSuccess={() => handleSuccess()}
  onCancel={() => handleCancel()}
/>
```

## API Integration

All components integrate with the Profile API routes:

- `GET /api/profiles` - List all profiles for authenticated user
- `POST /api/profiles` - Create new profile
- `GET /api/profiles/:id` - Get single profile
- `PATCH /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile
- `POST /api/profiles/:id/verify-pin` - Verify profile PIN

## Styling

All components follow the Netflix design system:

- Background: #141414
- Cards/Panels: #181818
- Elevated elements: #232323, #2F2F2F
- Accent color: #E50914
- Primary text: white
- Secondary text: #B3B3B3
- Muted text: #737373

## Dependencies

- shadcn/ui components: Button, Card, Input, Label, Switch
- Next.js: Image, useRouter
- lucide-react: Icons (Pencil, Trash2, Plus)
- Tailwind CSS: Styling

## Notes

- All components are client-side ('use client')
- Profile limit is enforced at 5 profiles per account
- Avatar images should be placed in `/public/avatars/` directory
- PIN protection requires bcrypt hashing on the backend
- All forms include proper validation and error handling
