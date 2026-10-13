'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePlayerSettings } from '@/lib/hooks/use-player-settings';
import { Check, ChevronDown, Sliders, Palette, EyeOff, User, Trash2 } from 'lucide-react';

const COLOR_PRESETS = [
  { label: 'Classic Red', hex: 'e50914', preview: '#E50914' },
  { label: 'Neon Cyan', hex: '00d1b2', preview: '#00D1B2' },
  { label: 'Violet', hex: '8b5cf6', preview: '#8B5CF6' },
  { label: 'Gold', hex: 'f59e0b', preview: '#F59E0B' },
  { label: 'Emerald', hex: '10b981', preview: '#10B981' },
  { label: 'Coral', hex: 'ff4b55', preview: '#FF4B55' },
];

const FONTS = [
  { label: 'Inter (Clean)', value: 'Inter' },
  { label: 'Netflix Sans', value: 'Netflix Sans' },
  { label: 'Bebas Neue (Cinematic)', value: 'Bebas Neue' },
  { label: 'Outfit (Modern)', value: 'Outfit' },
  { label: 'Roboto', value: 'Roboto' },
];

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative h-6 w-12 rounded-full transition-colors duration-200 cursor-pointer flex-shrink-0 ${
        checked ? 'bg-white' : 'bg-white/20 hover:bg-white/30'
      }`}
    >
      <div
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full transition-transform duration-200 ${
          checked ? 'translate-x-6 bg-black' : 'translate-x-0 bg-white'
        }`}
      />
    </button>
  );
}

function CustomSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) window.addEventListener('mousedown', handleClick);
    return () => window.removeEventListener('mousedown', handleClick);
  }, [open]);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-[#202330] hover:bg-[#282b3d] border border-white/15 hover:border-white/30 text-white text-xs font-medium transition-all cursor-pointer min-w-[170px] sm:min-w-[210px] shadow-sm"
      >
        <span className="truncate pr-1">{selectedOption.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-white/60 flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-full w-max max-w-[280px] rounded-xl border border-white/15 bg-[#171926]/98 p-1.5 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs font-medium text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-white flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function SettingsTab() {
  const { user } = useUser();
  const { settings, updateSetting, isLoaded } = usePlayerSettings();
  const [activeSidebarTab, setActiveSidebarTab] = useState<'playback' | 'appearance' | 'controls' | 'account'>('playback');
  const [savedBanner, setSavedBanner] = useState(false);
  const [clearedHistory, setClearedHistory] = useState(false);

  const showSaveSuccess = () => {
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 1800);
  };

  const handleToggle = (key: keyof typeof settings) => {
    const val = !settings[key];
    updateSetting(key as any, val);
    showSaveSuccess();
  };

  const handleChange = (key: keyof typeof settings, value: any) => {
    updateSetting(key as any, value);
    showSaveSuccess();
  };

  const handleClearHistory = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cinrift_continue_watching');
      localStorage.removeItem('continue_watching');
      setClearedHistory(true);
      setTimeout(() => setClearedHistory(false), 2000);
    }
  };

  const sidebarTabs = [
    { id: 'playback' as const, label: 'Playback', icon: Sliders },
    { id: 'appearance' as const, label: 'Appearance', icon: Palette },
    { id: 'controls' as const, label: 'Controls', icon: EyeOff },
    { id: 'account' as const, label: 'Account', icon: User },
  ];

  if (!isLoaded) {
    return (
      <main className="mx-auto max-w-[1200px] px-8 md:px-16 pb-16 pt-24">
        <div className="h-10 w-48 bg-white/10 rounded-lg animate-pulse mb-8" />
        <div className="h-96 w-full bg-white/5 rounded-2xl animate-pulse" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1200px] px-6 sm:px-12 md:px-16 pb-20 pt-24">
      {/* Header */}
      <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-2">Settings</h1>
          <p className="text-white/50 text-sm">Customise your streaming preferences and player experience.</p>
        </div>

        {savedBanner && (
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-4 py-1.5 text-xs font-medium text-emerald-300 shadow-lg backdrop-blur-md animate-in fade-in duration-200">
            <Check className="h-3.5 w-3.5" />
            <span>Changes saved</span>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 md:gap-14">
        {/* Sidebar */}
        <div className="w-full md:w-56 flex-shrink-0">
          <nav className="flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {sidebarTabs.map((tab) => {
              const active = activeSidebarTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSidebarTab(tab.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-left whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-white/10 text-white shadow-sm border border-white/10 font-semibold'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-white/40'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content Panel */}
        <div className="flex-1 max-w-3xl">
          <div className="bg-[#14161f]/90 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
            {/* 1. PLAYBACK */}
            {activeSidebarTab === 'playback' && (
              <div>
                <div className="mb-6 pb-4 border-b border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-1">Playback</h2>
                  <p className="text-white/40 text-xs">Quality, audio, and autoplay preferences.</p>
                </div>

                <div className="space-y-6">
                  {/* Quality Dropdown */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div className="min-w-0 pr-2">
                      <p className="text-white font-medium text-sm mb-0.5">Streaming Quality</p>
                      <p className="text-white/40 text-xs">Default video resolution for playback.</p>
                    </div>
                    <CustomSelect
                      value={settings.quality}
                      onChange={(val) => handleChange('quality', val)}
                      options={[
                        { label: 'Auto (Recommended)', value: 'Auto' },
                        { label: '1080p High Definition', value: '1080p' },
                        { label: '720p Standard HD', value: '720p' },
                        { label: '480p Basic', value: '480p' },
                        { label: '360p Data Saver', value: '360p' },
                      ]}
                    />
                  </div>

                  {/* Audio Track Dropdown */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div className="min-w-0 pr-2">
                      <p className="text-white font-medium text-sm mb-0.5">Audio Language</p>
                      <p className="text-white/40 text-xs">Choose between original audio and English dubbed.</p>
                    </div>
                    <CustomSelect
                      value={settings.preferDub ? 'dub' : 'original'}
                      onChange={(val) => handleChange('preferDub', val === 'dub')}
                      options={[
                        { label: 'Original Audio (Subtitles)', value: 'original' },
                        { label: 'English Dub', value: 'dub' },
                      ]}
                    />
                  </div>

                  {/* Controls Style Dropdown */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div className="min-w-0 pr-2">
                      <p className="text-white font-medium text-sm mb-0.5">Controls Style</p>
                      <p className="text-white/40 text-xs">Detailed labels or minimalist icon buttons.</p>
                    </div>
                    <CustomSelect
                      value={settings.playerLayout}
                      onChange={(val) => handleChange('playerLayout', val)}
                      options={[
                        { label: 'Detailed (With Labels)', value: 'labeled' },
                        { label: 'Minimalist (Icons Only)', value: 'default' },
                      ]}
                    />
                  </div>

                  {/* Interface Size Dropdown */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div className="min-w-0 pr-2">
                      <p className="text-white font-medium text-sm mb-0.5">Player Size</p>
                      <p className="text-white/40 text-xs">Scale of buttons and sliders on screen.</p>
                    </div>
                    <CustomSelect
                      value={settings.uiScale}
                      onChange={(val) => handleChange('uiScale', val)}
                      options={[
                        { label: 'Standard (1.0x)', value: '1.0' },
                        { label: 'Compact (0.85x)', value: '0.85' },
                        { label: 'Large (1.5x TV Size)', value: '1.5' },
                      ]}
                    />
                  </div>

                  {/* Autoplay on Start */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">Autoplay on Load</p>
                      <p className="text-white/40 text-xs">Start playback automatically when a title opens.</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.autoplay}
                      onChange={() => handleToggle('autoplay')}
                    />
                  </div>

                  {/* Start Muted */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">Start Video Muted</p>
                      <p className="text-white/40 text-xs">Start muted and enable audio on first click.</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.startMuted}
                      onChange={() => handleToggle('startMuted')}
                    />
                  </div>

                  {/* Autoplay Next Episode */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div className="pr-2">
                      <p className="text-white font-medium text-sm mb-0.5">Autoplay Next Episode</p>
                      <p className="text-white/40 text-xs">Automatically countdown and play the next episode.</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.autoplayNext}
                      onChange={() => handleToggle('autoplayNext')}
                    />
                  </div>

                  {/* Skip Intros */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div className="pr-2">
                      <p className="text-white font-medium text-sm mb-0.5">Skip Intros & Recaps</p>
                      <p className="text-white/40 text-xs">Automatically skip opening sequences and recaps.</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.skipIntros}
                      onChange={() => handleToggle('skipIntros')}
                    />
                  </div>

                  {/* Home Banner Trailer */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">Home Banner Previews</p>
                      <p className="text-white/40 text-xs">Autoplay featured trailers on the home screen banner.</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.heroTrailer}
                      onChange={() => handleToggle('heroTrailer')}
                    />
                  </div>

                  {/* Card Hover Previews */}
                  <div className="flex items-center justify-between py-2 gap-4">
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">Card Hover Previews</p>
                      <p className="text-white/40 text-xs">Play video previews when hovering cards on desktop.</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.cardPreviews}
                      onChange={() => handleToggle('cardPreviews')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. APPEARANCE */}
            {activeSidebarTab === 'appearance' && (
              <div>
                <div className="mb-6 pb-4 border-b border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-1">Appearance</h2>
                  <p className="text-white/40 text-xs">Customise player colors, fonts, and display elements.</p>
                </div>

                <div className="space-y-6">
                  {/* Accent Color Chips */}
                  <div className="py-2 border-b border-white/5">
                    <p className="text-white font-medium text-sm mb-1">Player Theme Color</p>
                    <p className="text-white/40 text-xs mb-3">Color used for the progress bar and highlights.</p>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {COLOR_PRESETS.map((color) => {
                        const isSelected = settings.brandColor.toLowerCase() === color.hex.toLowerCase();
                        return (
                          <button
                            key={color.hex}
                            type="button"
                            onClick={() => handleChange('brandColor', color.hex)}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? 'border-white bg-white/20 text-white ring-2 ring-white/30 shadow-md'
                                : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <span
                              className="h-3.5 w-3.5 rounded-full shadow-sm"
                              style={{ backgroundColor: color.preview }}
                            />
                            <span>{color.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Subtitle Font */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div className="min-w-0 pr-2">
                      <p className="text-white font-medium text-sm mb-0.5">Player Typography</p>
                      <p className="text-white/40 text-xs">Font family used for subtitles and controls.</p>
                    </div>
                    <CustomSelect
                      value={settings.font}
                      onChange={(val) => handleChange('font', val)}
                      options={FONTS}
                    />
                  </div>

                  {/* Corner Brand Logo */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">Corner Brand Logo</p>
                      <p className="text-white/40 text-xs">Display a subtle watermark logo while controls are idle.</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.watermark}
                      onChange={() => handleToggle('watermark')}
                    />
                  </div>

                  {/* High Contrast Strip */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div className="min-w-0 pr-2">
                      <p className="text-white font-medium text-sm mb-0.5">Controls Contrast</p>
                      <p className="text-white/40 text-xs">Dark strip background behind buttons for bright scenes.</p>
                    </div>
                    <CustomSelect
                      value={settings.controlBg}
                      onChange={(val) => handleChange('controlBg', val)}
                      options={[
                        { label: 'Smooth Gradient (Default)', value: 'gradient' },
                        { label: 'Solid Dark Strip (High Contrast)', value: 'solid' },
                      ]}
                    />
                  </div>

                  {/* Always Show Title Bar */}
                  <div className="flex items-center justify-between py-2 gap-4">
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">Always Show Title Bar</p>
                      <p className="text-white/40 text-xs">Keep the title visible in windowed mode.</p>
                    </div>
                    <ToggleSwitch
                      checked={settings.showTitle}
                      onChange={() => handleToggle('showTitle')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 3. CONTROLS VISIBILITY */}
            {activeSidebarTab === 'controls' && (
              <div>
                <div className="mb-6 pb-4 border-b border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-1">Controls Visibility</h2>
                  <p className="text-white/40 text-xs">Choose which playback buttons appear on screen.</p>
                </div>

                <div className="space-y-6">
                  {/* Hide Lock */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">Screen Lock Button</p>
                      <p className="text-white/40 text-xs">Show padlock to lock controls against accidental taps.</p>
                    </div>
                    <ToggleSwitch
                      checked={!settings.hideLock}
                      onChange={() => handleToggle('hideLock')}
                    />
                  </div>

                  {/* Hide Cast */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">AirPlay & Cast</p>
                      <p className="text-white/40 text-xs">Show casting button to stream to other screens.</p>
                    </div>
                    <ToggleSwitch
                      checked={!settings.hideCast}
                      onChange={() => handleToggle('hideCast')}
                    />
                  </div>

                  {/* Hide PiP */}
                  <div className="flex items-center justify-between py-2 border-b border-white/5 gap-4">
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">Picture-in-Picture</p>
                      <p className="text-white/40 text-xs">Show floating mini-player button.</p>
                    </div>
                    <ToggleSwitch
                      checked={!settings.hidePip}
                      onChange={() => handleToggle('hidePip')}
                    />
                  </div>

                  {/* Hide Server Switcher */}
                  <div className="flex items-center justify-between py-2 gap-4">
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">Stream Switcher</p>
                      <p className="text-white/40 text-xs">Show manual stream source selector button.</p>
                    </div>
                    <ToggleSwitch
                      checked={!settings.hideServer}
                      onChange={() => handleToggle('hideServer')}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. ACCOUNT & STORAGE */}
            {activeSidebarTab === 'account' && (
              <div>
                <div className="mb-6 pb-4 border-b border-white/10">
                  <h2 className="text-xl font-semibold text-white mb-1">Account & Storage</h2>
                  <p className="text-white/40 text-xs">Manage device cache and account information.</p>
                </div>

                <div className="space-y-6">
                  {/* Account Card */}
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt="User"
                          className="h-10 w-10 rounded-full object-cover border border-white/20"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-[#e50914] flex items-center justify-center font-bold text-white">
                          {user?.firstName?.[0] || 'U'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                          {user?.fullName || user?.firstName || 'Logged In'}
                        </p>
                        <p className="text-white/40 text-xs truncate">
                          {user?.primaryEmailAddress?.emailAddress || 'Active Session'}
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-medium border border-emerald-500/30">
                      Active
                    </span>
                  </div>

                  {/* Clear Watch History */}
                  <div className="flex items-center justify-between py-2 gap-4">
                    <div>
                      <p className="text-white font-medium text-sm mb-0.5">Clear Playback History</p>
                      <p className="text-white/40 text-xs">Reset saved resume points and watch progress.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 text-xs font-medium transition-colors cursor-pointer shadow-sm flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>{clearedHistory ? 'Cleared!' : 'Clear Cache'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
