'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Announcement from './components/Announcement';
import FundItem from './components/funds/FundItem';
import AddFundToGroupModal from './components/modals/AddFundToGroupModal';
import AddResultModal from './components/modals/AddResultModal';
import FeedbackModal from './components/modals/FeedbackModal';
import GroupManageModal from './components/modals/GroupManageModal';
import GroupModal from './components/modals/GroupModal';
import SettingsModal from './components/modals/SettingsModal';
import SuccessModal from './components/modals/SuccessModal';
import { CloseIcon, GridIcon, ListIcon, PlusIcon, RefreshIcon, SettingsIcon, SortIcon } from './components/common/icons';
import useFunds from './hooks/useFunds';
import useGroups from './hooks/useGroups';
import useImportExport from './hooks/useImportExport';
import useModalLock from './hooks/useModalLock';
import useSearch from './hooks/useSearch';
import useSettings from './hooks/useSettings';
import useTabsScroll from './hooks/useTabsScroll';

export default function HomePage() {
  const [currentTab, setCurrentTab] = useState('all');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('card');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackNonce, setFeedbackNonce] = useState(0);
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupManageOpen, setGroupManageOpen] = useState(false);
  const [addFundToGroupOpen, setAddFundToGroupOpen] = useState(false);
  const [addResultOpen, setAddResultOpen] = useState(false);
  const [addFailures, setAddFailures] = useState([]);
  const [successModal, setSuccessModal] = useState({ open: false, message: '' });

  const {
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
    removeFundFromAll
  } = useGroups();

  const {
    refreshMs,
    setRefreshMs,
    settingsOpen,
    setSettingsOpen,
    tempSeconds,
    setTempSeconds,
    saveSettings
  } = useSettings({ viewMode, setViewMode });

  const {
    funds,
    setFunds,
    loading,
    error,
    setError,
    refreshing,
    refreshAll,
    manualRefresh,
    addFundsByCodes,
    removeFund
  } = useFunds(refreshMs);

  const {
    searchTerm,
    searchResults,
    selectedFunds,
    isSearching,
    dropdownRef,
    showDropdown,
    setShowDropdown,
    handleSearchInput,
    toggleSelectFund,
    resetSearch
  } = useSearch();

  const { exportLocalData, handleImportFileChange, importFileRef, importMsg } = useImportExport({
    onSuccess: (message) => setSuccessModal({ open: true, message }),
    refreshAll,
    setFunds,
    setGroups,
    setFavorites,
    setCollapsedCodes,
    setViewMode,
    setRefreshMs,
    setTempSeconds,
    onCloseSettings: () => setSettingsOpen(false)
  });

  const {
    tabsRef,
    canLeft,
    canRight,
    updateTabOverflow,
    handleMouseDown,
    handleMouseLeaveOrUp,
    handleMouseMove,
    handleWheel
  } = useTabsScroll([groups, funds.length, favorites.size]);

  useModalLock(
    settingsOpen ||
      feedbackOpen ||
      addResultOpen ||
      addFundToGroupOpen ||
      groupManageOpen ||
      groupModalOpen ||
      successModal.open
  );

  // 过滤和排序后的基金列表
  const displayFunds = funds
    .filter(f => {
      if (currentTab === 'all') return true;
      if (currentTab === 'fav') return favorites.has(f.code);
      const group = groups.find(g => g.id === currentTab);
      return group ? group.codes.includes(f.code) : true;
    })
    .sort((a, b) => {
      if (sortBy === 'yield') {
        const valA = typeof a.estGszzl === 'number' ? a.estGszzl : (Number(a.gszzl) || 0);
        const valB = typeof b.estGszzl === 'number' ? b.estGszzl : (Number(b.gszzl) || 0);
        return valB - valA;
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name, 'zh-CN');
      if (sortBy === 'code') return a.code.localeCompare(b.code);
      return 0;
    });

  // 自动滚动选中 Tab 到可视区域
  useEffect(() => {
    if (!tabsRef.current) return;
    if (currentTab === 'all') {
      tabsRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      return;
    }
    const activeTab = tabsRef.current.querySelector('.tab.active');
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [currentTab]);

  const handleAddGroup = (name) => {
    addGroup(name, setCurrentTab);
    setGroupModalOpen(false);
  };

  const handleUpdateGroups = (newGroups) => {
    updateGroups(newGroups, currentTab, setCurrentTab);
  };

  const handleAddFundsToGroup = (codes) => {
    if (!codes || codes.length === 0) return;
    addFundsToGroup(codes, currentTab);
    setAddFundToGroupOpen(false);
    setSuccessModal({ open: true, message: `成功添加 ${codes.length} 支基金` });
  };

  const handleRemoveFund = (removeCode) => {
    removeFund(removeCode);
    removeFundFromAll(removeCode, setCurrentTab);
  };

  const addFund = async (e) => {
    e?.preventDefault?.();
    setError('');
    const manualTokens = String(searchTerm || '')
      .split(/[^0-9A-Za-z]+/)
      .map(t => t.trim())
      .filter(t => t.length > 0);
    const selectedCodes = Array.from(new Set([
      ...selectedFunds.map(f => f.CODE),
      ...manualTokens.filter(t => /^\d{6}$/.test(t))
    ]));
    if (selectedCodes.length === 0) {
      setError('请输入或选择基金代码');
      return;
    }
    const nameMap = {};
    selectedFunds.forEach(f => { nameMap[f.CODE] = f.NAME; });
    const { failures } = await addFundsByCodes(selectedCodes, nameMap);
    resetSearch();
    setShowDropdown(false);
    if (failures.length > 0) {
      setAddFailures(failures);
      setAddResultOpen(true);
    }
  };

  useEffect(() => {
    const onKey = (ev) => {
      if (ev.key === 'Escape' && settingsOpen) setSettingsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [settingsOpen, setSettingsOpen]);

  return (
    <div className="container content">
      <Announcement />
      <div className="navbar glass">
        {refreshing && <div className="loading-bar"></div>}
        <div className="brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="var(--accent)" strokeWidth="2" />
            <path d="M5 14c2-4 7-6 14-5" stroke="var(--primary)" strokeWidth="2" />
          </svg>
          <span>基估宝</span>
        </div>
        <div className="actions">
          <div className="badge" title="当前刷新频率">
            <span>刷新</span>
            <strong>{Math.round(refreshMs / 1000)}秒</strong>
          </div>
          <button
            className="icon-button"
            aria-label="立即刷新"
            onClick={manualRefresh}
            disabled={refreshing || funds.length === 0}
            aria-busy={refreshing}
            title="立即刷新"
          >
            <RefreshIcon className={refreshing ? 'spin' : ''} width="18" height="18" />
          </button>
          <button
            className="icon-button"
            aria-label="打开设置"
            onClick={() => setSettingsOpen(true)}
            title="设置"
          >
            <SettingsIcon width="18" height="18" />
          </button>
        </div>
      </div>

      <div className="grid">
        <div className="col-12 glass card add-fund-section" role="region" aria-label="添加基金">
          <div className="title" style={{ marginBottom: 12 }}>
            <PlusIcon width="20" height="20" />
            <span>添加基金</span>
            <span className="muted">搜索并选择基金（支持名称或代码）</span>
          </div>
          
          <div className="search-container" ref={dropdownRef}>
            <form className="form" onSubmit={addFund}>
              <div className="search-input-wrapper" style={{ flex: 1, gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                {selectedFunds.length > 0 && (
                  <div className="selected-inline-chips">
                    {selectedFunds.map(fund => (
                      <div key={fund.CODE} className="fund-chip">
                        <span>{fund.NAME}</span>
                        <button onClick={() => toggleSelectFund(fund)} className="remove-chip">
                          <CloseIcon width="14" height="14" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  className="input"
                  placeholder="搜索基金名称或代码..."
                  value={searchTerm}
                  onChange={handleSearchInput}
                  onFocus={() => setShowDropdown(true)}
                />
                {isSearching && <div className="search-spinner" />}
              </div>
              <button className="button" type="submit" disabled={loading}>
                {loading ? '添加中…' : '添加'}
              </button>
            </form>

            <AnimatePresence>
              {showDropdown && (searchTerm.trim() || searchResults.length > 0) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="search-dropdown glass"
                >
                  {searchResults.length > 0 ? (
                    <div className="search-results">
                      {searchResults.map((fund) => {
                        const isSelected = selectedFunds.some(f => f.CODE === fund.CODE);
                        const isAlreadyAdded = funds.some(f => f.code === fund.CODE);
                        return (
                          <div
                            key={fund.CODE}
                            className={`search-item ${isSelected ? 'selected' : ''} ${isAlreadyAdded ? 'added' : ''}`}
                            onClick={() => {
                              if (isAlreadyAdded) return;
                              toggleSelectFund(fund);
                            }}
                          >
                            <div className="fund-info">
                              <span className="fund-name">{fund.NAME}</span>
                              <span className="fund-code muted">#{fund.CODE} | {fund.TYPE}</span>
                            </div>
                            {isAlreadyAdded ? (
                              <span className="added-label">已添加</span>
                            ) : (
                              <div className="checkbox">
                                {isSelected && <div className="checked-mark" />}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : searchTerm.trim() && !isSearching ? (
                    <div className="no-results muted">未找到相关基金</div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          

          {error && <div className="muted" style={{ marginTop: 8, color: 'var(--danger)' }}>{error}</div>}
        </div>

        <div className="col-12">
          <div className="filter-bar" style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div className="tabs-container">
              <div 
                className="tabs-scroll-area"
                data-mask-left={canLeft}
                data-mask-right={canRight}
              >
                <div 
                    className="tabs" 
                    ref={tabsRef}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeaveOrUp}
                    onMouseUp={handleMouseLeaveOrUp}
                    onMouseMove={handleMouseMove}
                    onWheel={handleWheel}
                    onScroll={updateTabOverflow}
                  >
                    <AnimatePresence mode="popLayout">
                      <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key="all"
                        className={`tab ${currentTab === 'all' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('all')}
                        transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}
                      >
                        全部 ({funds.length})
                      </motion.button>
                      <motion.button
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        key="fav"
                        className={`tab ${currentTab === 'fav' ? 'active' : ''}`}
                        onClick={() => setCurrentTab('fav')}
                        transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}
                      >
                        自选 ({favorites.size})
                      </motion.button>
                      {groups.map(g => (
                        <motion.button
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          key={g.id}
                          className={`tab ${currentTab === g.id ? 'active' : ''}`}
                          onClick={() => setCurrentTab(g.id)}
                          transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}
                        >
                          {g.name} ({g.codes.length})
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </div>
              </div>
              {groups.length > 0 && (
                <button 
                  className="icon-button manage-groups-btn" 
                  onClick={() => setGroupManageOpen(true)}
                  title="管理分组"
                >
                  <SortIcon width="16" height="16" />
                </button>
              )}
              <button 
                className="icon-button add-group-btn" 
                onClick={() => setGroupModalOpen(true)}
                title="新增分组"
              >
                <PlusIcon width="16" height="16" />
              </button>
            </div>

            <div className="sort-group" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="view-toggle" style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' }}>
                  <button
                    className={`icon-button ${viewMode === 'card' ? 'active' : ''}`}
                    onClick={() => { setViewMode('card'); localStorage.setItem('viewMode', 'card'); }}
                    style={{ border: 'none', width: '32px', height: '32px', background: viewMode === 'card' ? 'var(--primary)' : 'transparent', color: viewMode === 'card' ? '#05263b' : 'var(--muted)' }}
                    title="卡片视图"
                  >
                    <GridIcon width="16" height="16" />
                  </button>
                  <button
                      className={`icon-button ${viewMode === 'list' ? 'active' : ''}`}
                      onClick={() => { setViewMode('list'); localStorage.setItem('viewMode', 'list'); }}
                      style={{ border: 'none', width: '32px', height: '32px', background: viewMode === 'list' ? 'var(--primary)' : 'transparent', color: viewMode === 'list' ? '#05263b' : 'var(--muted)' }}
                      title="表格视图"
                    >
                      <ListIcon width="16" height="16" />
                    </button>
                </div>

                <div className="divider" style={{ width: '1px', height: '20px', background: 'var(--border)' }} />

                <div className="sort-items" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="muted" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <SortIcon width="14" height="14" />
                    排序
                  </span>
                  <div className="chips">
                    {[
                      { id: 'default', label: '默认' },
                      { id: 'yield', label: '涨跌幅' },
                      { id: 'name', label: '名称' },
                      { id: 'code', label: '代码' }
                    ].map((s) => (
                      <button
                        key={s.id}
                        className={`chip ${sortBy === s.id ? 'active' : ''}`}
                        onClick={() => setSortBy(s.id)}
                        style={{ height: '28px', fontSize: '12px', padding: '0 10px' }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          {displayFunds.length === 0 ? (
            <div className="glass card empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: 16, opacity: 0.5 }}>📂</div>
              <div className="muted" style={{ marginBottom: 20 }}>{funds.length === 0 ? '尚未添加基金' : '该分组下暂无数据'}</div>
              {currentTab !== 'all' && currentTab !== 'fav' && funds.length > 0 && (
                <button className="button" onClick={() => setAddFundToGroupOpen(true)}>
                  添加基金到此分组
                </button>
              )}
            </div>
          ) : (
            <>
              {currentTab !== 'all' && currentTab !== 'fav' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                  <button 
                    className="button" 
                    onClick={() => setAddFundToGroupOpen(true)}
                    style={{ height: '32px', fontSize: '13px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <PlusIcon width="16" height="16" />
                    <span>添加基金</span>
                  </button>
                </div>
              )}
              <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={viewMode === 'card' ? 'grid' : 'table-container glass'}
              >
                <div className={viewMode === 'card' ? 'grid col-12' : ''} style={viewMode === 'card' ? { gridColumn: 'span 12', gap: 16 } : {}}>
                  <AnimatePresence mode="popLayout">
                    {displayFunds.map((fund) => (
                      <FundItem
                        key={fund.code}
                        fund={fund}
                        viewMode={viewMode}
                        currentTab={currentTab}
                        favorites={favorites}
                        collapsedCodes={collapsedCodes}
                        onToggleFavorite={(code) => toggleFavorite(code, () => setCurrentTab('all'))}
                        onRemoveFromGroup={(code) => removeFundFromCurrentGroup(code, currentTab)}
                        onRemoveFund={handleRemoveFund}
                        onToggleCollapse={toggleCollapse}
                      />
                    ))}
                </AnimatePresence>
                </div>
              </motion.div>
            </AnimatePresence>
          </>
          )}
        </div>
      </div>

      <div className="footer">
        <p>数据源：实时估值与重仓直连东方财富，仅供个人学习及参考使用。数据可能存在延迟，不作为任何投资建议
        </p>
        <p>注：估算数据与真实结算数据会有1%左右误差，非股票型基金误差较大</p>
        <div style={{ marginTop: 12, opacity: 0.8 }}>
          <p>
            遇到任何问题或需求建议可
            <button
              className="link-button"
              onClick={() => {
                setFeedbackNonce((n) => n + 1);
                setFeedbackOpen(true);
              }}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '0 4px', textDecoration: 'underline', fontSize: 'inherit', fontWeight: 600 }}
            >
              点此提交反馈
            </button>
          </p>
        </div>
      </div>

      <AnimatePresence>
        {feedbackOpen && (
          <FeedbackModal
            key={feedbackNonce}
            onClose={() => setFeedbackOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {addResultOpen && (
          <AddResultModal
            failures={addFailures}
            onClose={() => setAddResultOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {addFundToGroupOpen && (
          <AddFundToGroupModal
            allFunds={funds}
            currentGroupCodes={groups.find(g => g.id === currentTab)?.codes || []}
            onClose={() => setAddFundToGroupOpen(false)}
            onAdd={handleAddFundsToGroup}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {groupManageOpen && (
          <GroupManageModal
            groups={groups}
            onClose={() => setGroupManageOpen(false)}
            onSave={handleUpdateGroups}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {groupModalOpen && (
          <GroupModal
            onClose={() => setGroupModalOpen(false)}
            onConfirm={handleAddGroup}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {successModal.open && (
          <SuccessModal
            message={successModal.message}
            onClose={() => setSuccessModal({ open: false, message: '' })}
          />
        )}
      </AnimatePresence>

      {settingsOpen && (
        <SettingsModal
          tempSeconds={tempSeconds}
          setTempSeconds={setTempSeconds}
          importFileRef={importFileRef}
          importMsg={importMsg}
          onClose={() => setSettingsOpen(false)}
          onSave={saveSettings}
          onExport={exportLocalData}
          onImport={handleImportFileChange}
        />
      )}
    </div>
  );
}
