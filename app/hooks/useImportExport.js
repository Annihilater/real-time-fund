'use client';

import { useRef, useState } from 'react';
import { dedupeByCode } from '../lib/funds';
import { getJson, getNumber, setJson, setString } from '../lib/storage';

export default function useImportExport({
  onSuccess,
  refreshAll,
  setFunds,
  setGroups,
  setFavorites,
  setCollapsedCodes,
  setViewMode,
  setRefreshMs,
  setTempSeconds,
  onCloseSettings
}) {
  const importFileRef = useRef(null);
  const [importMsg, setImportMsg] = useState('');

  const exportLocalData = async () => {
    try {
      const payload = {
        version: 1,
        funds: getJson('funds', []),
        favorites: getJson('favorites', []),
        groups: getJson('groups', []),
        collapsedCodes: getJson('collapsedCodes', []),
        refreshMs: getNumber('refreshMs', 30000),
        viewMode: localStorage.getItem('viewMode') || 'card',
        exportedAt: new Date().toISOString()
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: `realtime-fund-config-${Date.now()}.json`,
          types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        if (onSuccess) onSuccess('导出成功');
        if (onCloseSettings) onCloseSettings();
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `realtime-fund-config-${Date.now()}.json`;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        URL.revokeObjectURL(url);
        if (onSuccess) onSuccess('导出成功');
        if (onCloseSettings) onCloseSettings();
      };
      const onVisibility = () => {
        if (document.visibilityState === 'hidden') return;
        finish();
        document.removeEventListener('visibilitychange', onVisibility);
      };
      document.addEventListener('visibilitychange', onVisibility, { once: true });
      a.click();
      setTimeout(finish, 3000);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const handleImportFileChange = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      if (data && typeof data === 'object') {
        const currentFunds = getJson('funds', []);
        const currentFavorites = getJson('favorites', []);
        const currentGroups = getJson('groups', []);
        const currentCollapsed = getJson('collapsedCodes', []);

        let mergedFunds = currentFunds;
        let appendedCodes = [];

        if (Array.isArray(data.funds)) {
          const incomingFunds = dedupeByCode(data.funds);
          const existingCodes = new Set(currentFunds.map(f => f.code));
          const newItems = incomingFunds.filter(f => f && f.code && !existingCodes.has(f.code));
          appendedCodes = newItems.map(f => f.code);
          mergedFunds = [...currentFunds, ...newItems];
          setFunds(mergedFunds);
          setJson('funds', mergedFunds);
        }

        if (Array.isArray(data.favorites)) {
          const mergedFav = Array.from(new Set([...currentFavorites, ...data.favorites]));
          setFavorites(new Set(mergedFav));
          setJson('favorites', mergedFav);
        }

        if (Array.isArray(data.groups)) {
          const mergedGroups = [...currentGroups];
          data.groups.forEach(incomingGroup => {
            const existingIdx = mergedGroups.findIndex(g => g.id === incomingGroup.id);
            if (existingIdx > -1) {
              mergedGroups[existingIdx] = {
                ...mergedGroups[existingIdx],
                codes: Array.from(new Set([...mergedGroups[existingIdx].codes, ...(incomingGroup.codes || [])]))
              };
            } else {
              mergedGroups.push(incomingGroup);
            }
          });
          setGroups(mergedGroups);
          setJson('groups', mergedGroups);
        }

        if (Array.isArray(data.collapsedCodes)) {
          const mergedCollapsed = Array.from(new Set([...currentCollapsed, ...data.collapsedCodes]));
          setCollapsedCodes(new Set(mergedCollapsed));
          setJson('collapsedCodes', mergedCollapsed);
        }

        if (typeof data.refreshMs === 'number' && data.refreshMs >= 5000) {
          setRefreshMs(data.refreshMs);
          setTempSeconds(Math.round(data.refreshMs / 1000));
          setString('refreshMs', data.refreshMs);
        }
        if (data.viewMode === 'card' || data.viewMode === 'list') {
          setViewMode(data.viewMode);
          setString('viewMode', data.viewMode);
        }

        if (appendedCodes.length) {
          const allCodes = mergedFunds.map(f => f.code);
          await refreshAll(allCodes);
        }

        if (onSuccess) onSuccess('导入成功');
        if (onCloseSettings) onCloseSettings();
        if (importFileRef.current) importFileRef.current.value = '';
      }
    } catch (err) {
      console.error('Import error:', err);
      setImportMsg('导入失败，请检查文件格式');
      setTimeout(() => setImportMsg(''), 4000);
      if (importFileRef.current) importFileRef.current.value = '';
    }
  };

  return {
    exportLocalData,
    handleImportFileChange,
    importFileRef,
    importMsg
  };
}
