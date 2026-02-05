'use client';

import { useEffect, useState } from 'react';
import { getJson, setJson } from '../lib/storage';

export default function useGroups() {
  const [favorites, setFavorites] = useState(new Set());
  const [groups, setGroups] = useState([]);
  const [collapsedCodes, setCollapsedCodes] = useState(new Set());

  useEffect(() => {
    const savedCollapsed = getJson('collapsedCodes', []);
    if (Array.isArray(savedCollapsed)) {
      setCollapsedCodes(new Set(savedCollapsed));
    }
    const savedFavorites = getJson('favorites', []);
    if (Array.isArray(savedFavorites)) {
      setFavorites(new Set(savedFavorites));
    }
    const savedGroups = getJson('groups', []);
    if (Array.isArray(savedGroups)) {
      setGroups(savedGroups);
    }
  }, []);

  const toggleFavorite = (code, onEmpty) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      setJson('favorites', Array.from(next));
      if (next.size === 0 && onEmpty) onEmpty();
      return next;
    });
  };

  const toggleCollapse = (code) => {
    setCollapsedCodes(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      setJson('collapsedCodes', Array.from(next));
      return next;
    });
  };

  const addGroup = (name, setCurrentTab) => {
    const newGroup = {
      id: `group_${Date.now()}`,
      name,
      codes: []
    };
    const next = [...groups, newGroup];
    setGroups(next);
    setJson('groups', next);
    if (setCurrentTab) setCurrentTab(newGroup.id);
  };

  const updateGroups = (newGroups, currentTab, setCurrentTab) => {
    setGroups(newGroups);
    setJson('groups', newGroups);
    if (currentTab !== 'all' && currentTab !== 'fav' && !newGroups.find(g => g.id === currentTab)) {
      if (setCurrentTab) setCurrentTab('all');
    }
  };

  const addFundsToGroup = (codes, currentTab) => {
    if (!codes || codes.length === 0) return;
    const next = groups.map(g => {
      if (g.id === currentTab) {
        return {
          ...g,
          codes: Array.from(new Set([...g.codes, ...codes]))
        };
      }
      return g;
    });
    setGroups(next);
    setJson('groups', next);
  };

  const removeFundFromCurrentGroup = (code, currentTab) => {
    const next = groups.map(g => {
      if (g.id === currentTab) {
        return {
          ...g,
          codes: g.codes.filter(c => c !== code)
        };
      }
      return g;
    });
    setGroups(next);
    setJson('groups', next);
  };

  const toggleFundInGroup = (code, groupId) => {
    const next = groups.map(g => {
      if (g.id === groupId) {
        const has = g.codes.includes(code);
        return {
          ...g,
          codes: has ? g.codes.filter(c => c !== code) : [...g.codes, code]
        };
      }
      return g;
    });
    setGroups(next);
    setJson('groups', next);
  };

  const removeFundFromAll = (removeCode, setCurrentTab) => {
    const nextGroups = groups.map(g => ({
      ...g,
      codes: g.codes.filter(c => c !== removeCode)
    }));
    setGroups(nextGroups);
    setJson('groups', nextGroups);

    setCollapsedCodes(prev => {
      if (!prev.has(removeCode)) return prev;
      const nextSet = new Set(prev);
      nextSet.delete(removeCode);
      setJson('collapsedCodes', Array.from(nextSet));
      return nextSet;
    });

    setFavorites(prev => {
      if (!prev.has(removeCode)) return prev;
      const nextSet = new Set(prev);
      nextSet.delete(removeCode);
      setJson('favorites', Array.from(nextSet));
      if (nextSet.size === 0 && setCurrentTab) setCurrentTab('all');
      return nextSet;
    });
  };

  return {
    favorites,
    groups,
    collapsedCodes,
    setGroups,
    setFavorites,
    setCollapsedCodes,
    toggleFavorite,
    toggleCollapse,
    addGroup,
    updateGroups,
    addFundsToGroup,
    removeFundFromCurrentGroup,
    toggleFundInGroup,
    removeFundFromAll
  };
}
