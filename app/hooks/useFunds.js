'use client';

import { useEffect, useRef, useState } from 'react';
import { dedupeByCode, fetchFundData } from '../lib/funds';
import { getJson, setJson } from '../lib/storage';

export default function useFunds(refreshMs) {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const timerRef = useRef(null);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const saved = getJson('funds', []);
    if (Array.isArray(saved) && saved.length) {
      const deduped = dedupeByCode(saved);
      setFunds(deduped);
      setJson('funds', deduped);
      const codes = Array.from(new Set(deduped.map((f) => f.code)));
      if (codes.length) {
        refreshAll(codes);
      }
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const codes = Array.from(new Set(funds.map((f) => f.code)));
      if (codes.length) refreshAll(codes);
    }, refreshMs);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [funds, refreshMs]);

  const refreshAll = async (codes) => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);
    const uniqueCodes = Array.from(new Set(codes));
    try {
      const updated = [];
      for (const c of uniqueCodes) {
        try {
          const data = await fetchFundData(c);
          updated.push(data);
        } catch (err) {
          console.error(`刷新基金 ${c} 失败`, err);
          setFunds(prev => {
            const old = prev.find((f) => f.code === c);
            if (old) updated.push(old);
            return prev;
          });
        }
      }

      if (updated.length > 0) {
        setFunds(prev => {
          const merged = [...prev];
          updated.forEach(u => {
            const idx = merged.findIndex(f => f.code === u.code);
            if (idx > -1) {
              merged[idx] = u;
            } else {
              merged.push(u);
            }
          });
          const deduped = dedupeByCode(merged);
          setJson('funds', deduped);
          return deduped;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  };

  const manualRefresh = async () => {
    if (refreshingRef.current) return;
    const codes = Array.from(new Set(funds.map((f) => f.code)));
    if (!codes.length) return;
    await refreshAll(codes);
  };

  const addFundsByCodes = async (codes, nameMap = {}) => {
    setLoading(true);
    setError('');
    try {
      const newFunds = [];
      const failures = [];
      for (const c of codes) {
        if (funds.some((f) => f.code === c)) continue;
        try {
          const data = await fetchFundData(c);
          newFunds.push(data);
        } catch (err) {
          failures.push({ code: c, name: nameMap[c] });
        }
      }
      if (newFunds.length === 0) {
        setError('未添加任何新基金');
      } else {
        const next = dedupeByCode([...newFunds, ...funds]);
        setFunds(next);
        setJson('funds', next);
      }
      return { failures, added: newFunds.length };
    } catch (err) {
      setError(err.message || '添加失败');
      return { failures: [], added: 0 };
    } finally {
      setLoading(false);
    }
  };

  const batchAddFunds = async (selectedFunds) => {
    if (selectedFunds.length === 0) return { added: 0 };
    setLoading(true);
    setError('');
    try {
      const newFunds = [];
      for (const f of selectedFunds) {
        if (funds.some(existing => existing.code === f.CODE)) continue;
        try {
          const data = await fetchFundData(f.CODE);
          newFunds.push(data);
        } catch (err) {
          console.error(`添加基金 ${f.CODE} 失败`, err);
        }
      }

      if (newFunds.length > 0) {
        const updated = dedupeByCode([...newFunds, ...funds]);
        setFunds(updated);
        setJson('funds', updated);
      }
      return { added: newFunds.length };
    } catch (err) {
      setError('批量添加失败');
      return { added: 0 };
    } finally {
      setLoading(false);
    }
  };

  const removeFund = (removeCode) => {
    const next = funds.filter((f) => f.code !== removeCode);
    setFunds(next);
    setJson('funds', next);
  };

  return {
    funds,
    setFunds,
    loading,
    error,
    setError,
    refreshing,
    refreshAll,
    manualRefresh,
    addFundsByCodes,
    batchAddFunds,
    removeFund
  };
}
