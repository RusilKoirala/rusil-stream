import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Pause, Play, RotateCcw, RotateCw, ArrowLeft } from 'lucide-react-native';
import { formatTime } from '@/lib/vidking-bridge';

interface TVPlayerControlsProps {
  visible: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  title?: string;
  onTogglePlay: () => void;
  onSeekBack: () => void;
  onSeekForward: () => void;
  onBack: () => void;
}

export function TVPlayerControls({
  visible,
  isPlaying,
  currentTime,
  duration,
  title,
  onTogglePlay,
  onSeekBack,
  onSeekForward,
  onBack,
}: TVPlayerControlsProps) {
  const [focused, setFocused] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setFocused(null), 8000);
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [visible, isPlaying, currentTime]);

  if (!visible) return null;

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <View style={styles.root} pointerEvents="box-none">
      <View style={styles.topRow}>
        <TouchableOpacity
          style={[styles.chip, focused === 'back' && styles.chipFocused]}
          onFocus={() => setFocused('back')}
          onBlur={() => setFocused(null)}
          onPress={onBack}
          activeOpacity={0.85}
        >
          <ArrowLeft size={18} color="#fff" />
          <Text style={styles.chipText}>Back</Text>
        </TouchableOpacity>
        {title ? <Text style={styles.title} numberOfLines={1}>{title}</Text> : null}
      </View>

      <View style={styles.bar}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.timeText}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Text>

        <View style={styles.controls}>
          <ControlBtn
            id="back10"
            focused={focused}
            setFocused={setFocused}
            onPress={onSeekBack}
            label="-10s"
          >
            <RotateCcw size={22} color="#fff" />
          </ControlBtn>

          <ControlBtn
            id="play"
            focused={focused}
            setFocused={setFocused}
            onPress={onTogglePlay}
            label={isPlaying ? 'Pause' : 'Play'}
            large
            hasTVPreferredFocus
          >
            {isPlaying ? (
              <Pause size={28} color="#fff" fill="#fff" />
            ) : (
              <Play size={28} color="#fff" fill="#fff" />
            )}
          </ControlBtn>

          <ControlBtn
            id="fwd10"
            focused={focused}
            setFocused={setFocused}
            onPress={onSeekForward}
            label="+10s"
          >
            <RotateCw size={22} color="#fff" />
          </ControlBtn>


        </View>
      </View>
    </View>
  );
}

function ControlBtn({
  id,
  focused,
  setFocused,
  onPress,
  label,
  large,
  hasTVPreferredFocus,
  children,
}: {
  id: string;
  focused: string | null;
  setFocused: (v: string | null) => void;
  onPress: () => void;
  label: string;
  large?: boolean;
  hasTVPreferredFocus?: boolean;
  children: ReactNode;
}) {
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        large && styles.btnLarge,
        focused === id && styles.btnFocused,
      ]}
      onFocus={() => setFocused(id)}
      onBlur={() => setFocused(null)}
      onPress={onPress}
      activeOpacity={0.85}
      hasTVPreferredFocus={hasTVPreferredFocus}
      accessibilityLabel={label}
    >
      {children}
      <Text style={styles.btnLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    zIndex: 30,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 40,
    paddingTop: 24,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingBottom: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chipFocused: {
    borderColor: '#fff',
    backgroundColor: 'rgba(255,255,255,0.2)',
    transform: [{ scale: 1.05 }],
  },
  chipText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  title: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },

  bar: {
    backgroundColor: 'rgba(0,0,0,0.82)',
    paddingHorizontal: 48,
    paddingTop: 16,
    paddingBottom: 28,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#E50914',
  },
  timeText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
    marginBottom: 14,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    padding: 14,
    minWidth: 72,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  btnLarge: {
    minWidth: 88,
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  btnFocused: {
    borderColor: '#fff',
    backgroundColor: 'rgba(229,9,20,0.85)',
    transform: [{ scale: 1.08 }],
  },
  btnLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 6,
    fontWeight: '600',
  },
});
