'use client';

import { useEffect, useState } from 'react';
import { getNumber, setString } from '../lib/storage';

export default function useSettings({ viewMode, setViewMode }) {
  const [refreshMs, setRefreshMs] = useState(30000);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tempSeconds, setTempSeconds] = useState(30);

  useEffect(() => {
    const savedMs = getNumber('refreshMs', 30000);
    if (Number.isFinite(savedMs) && savedMs >= 5000) {
      setRefreshMs(savedMs);
      setTempSeconds(Math.round(savedMs / 1000));
    }

    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode === 'card' || savedViewMode === 'list') {
      setViewMode(savedViewMode);
    }
  }, [setViewMode]);

  const saveSettings = (e) => {
    e?.preventDefault?.();
    const ms = Math.max(5, Number(tempSeconds)) * 1000;
    setRefreshMs(ms);
    setString('refreshMs', ms);
    setSettingsOpen(false);
  };

  return {
    refreshMs,
    setRefreshMs,
    settingsOpen,
    setSettingsOpen,
    tempSeconds,
    setTempSeconds,
    saveSettings
  };
}
