'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Stat from '../common/Stat';
import { ChevronIcon, ExitIcon, StarIcon, TrashIcon } from '../common/icons';

export default function FundItem({
  fund,
  viewMode,
  currentTab,
  favorites,
  collapsedCodes,
  onToggleFavorite,
  onRemoveFromGroup,
  onRemoveFund,
  onToggleCollapse
}) {
  const isInGroupTab = currentTab !== 'all' && currentTab !== 'fav';
  const isFavorite = favorites.has(fund.code);
  const isCollapsed = collapsedCodes.has(fund.code);
  const estCovered = fund.estPricedCoverage > 0.05;

  const changeClass = estCovered
    ? (fund.estGszzl > 0 ? 'up' : fund.estGszzl < 0 ? 'down' : '')
    : (Number(fund.gszzl) > 0 ? 'up' : Number(fund.gszzl) < 0 ? 'down' : '');

  const changeValue = estCovered
    ? `${fund.estGszzl > 0 ? '+' : ''}${fund.estGszzl.toFixed(2)}%`
    : (typeof fund.gszzl === 'number'
        ? `${fund.gszzl > 0 ? '+' : ''}${fund.gszzl.toFixed(2)}%`
        : fund.gszzl ?? '—');

  const priceValue = estCovered ? fund.estGsz.toFixed(4) : (fund.gsz ?? '—');

  return (
    <motion.div
      layout="position"
      key={fund.code}
      className={viewMode === 'card' ? 'col-6' : 'table-row-wrapper'}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <div className={viewMode === 'card' ? 'glass card' : 'table-row'}>
        {viewMode === 'list' ? (
          <>
            <div className="table-cell name-cell">
              {isInGroupTab ? (
                <button
                  className="icon-button fav-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromGroup(fund.code);
                  }}
                  title="从当前分组移除"
                >
                  <ExitIcon width="18" height="18" style={{ transform: 'rotate(180deg)' }} />
                </button>
              ) : (
                <button
                  className={`icon-button fav-button ${isFavorite ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(fund.code);
                  }}
                  title={isFavorite ? '取消自选' : '添加自选'}
                >
                  <StarIcon width="18" height="18" filled={isFavorite} />
                </button>
              )}
              <div className="title-text">
                <span className="name-text">{fund.name}</span>
                <span className="muted code-text">#{fund.code}</span>
              </div>
            </div>
            <div className="table-cell text-right value-cell">
              <span style={{ fontWeight: 700 }}>{priceValue}</span>
            </div>
            <div className="table-cell text-right change-cell">
              <span className={changeClass} style={{ fontWeight: 700 }}>
                {changeValue}
              </span>
            </div>
            <div className="table-cell text-right time-cell">
              <span className="muted" style={{ fontSize: '12px' }}>{fund.gztime || fund.time || '-'}</span>
            </div>
            <div className="table-cell text-center action-cell" style={{ gap: 4 }}>
              <button
                className="icon-button danger"
                onClick={() => onRemoveFund(fund.code)}
                title="删除"
                style={{ width: '28px', height: '28px' }}
              >
                <TrashIcon width="14" height="14" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="row" style={{ marginBottom: 10 }}>
              <div className="title">
                {isInGroupTab ? (
                  <button
                    className="icon-button fav-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveFromGroup(fund.code);
                    }}
                    title="从当前分组移除"
                  >
                    <ExitIcon width="18" height="18" style={{ transform: 'rotate(180deg)' }} />
                  </button>
                ) : (
                  <button
                    className={`icon-button fav-button ${isFavorite ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(fund.code);
                    }}
                    title={isFavorite ? '取消自选' : '添加自选'}
                  >
                    <StarIcon width="18" height="18" filled={isFavorite} />
                  </button>
                )}
                <div className="title-text">
                  <span>{fund.name}</span>
                  <span className="muted">#{fund.code}</span>
                </div>
              </div>

              <div className="actions">
                <div className="badge-v">
                  <span>估值时间</span>
                  <strong>{fund.gztime || fund.time || '-'}</strong>
                </div>
                <div className="row" style={{ gap: 4 }}>
                  <button
                    className="icon-button danger"
                    onClick={() => onRemoveFund(fund.code)}
                    title="删除"
                    style={{ width: '28px', height: '28px' }}
                  >
                    <TrashIcon width="14" height="14" />
                  </button>
                </div>
              </div>
            </div>

            <div className="row" style={{ marginBottom: 12 }}>
              <Stat label="单位净值" value={fund.dwjz ?? '—'} />
              <Stat label="估值净值" value={priceValue} />
              <Stat
                label="估值涨跌幅"
                value={changeValue}
                delta={estCovered ? fund.estGszzl : (Number(fund.gszzl) || 0)}
              />
            </div>
            {estCovered && (
              <div style={{ fontSize: '10px', color: 'var(--muted)', marginTop: -8, marginBottom: 10, textAlign: 'right' }}>
                基于 {Math.round(fund.estPricedCoverage * 100)}% 持仓估算
              </div>
            )}
            <div
              style={{ marginBottom: 8, cursor: 'pointer', userSelect: 'none' }}
              className="title"
              onClick={() => onToggleCollapse(fund.code)}
            >
              <div className="row" style={{ width: '100%', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>前10重仓股票</span>
                  <ChevronIcon
                    width="16"
                    height="16"
                    className="muted"
                    style={{
                      transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease'
                    }}
                  />
                </div>
                <span className="muted">涨跌幅 / 占比</span>
              </div>
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  style={{ overflow: 'hidden' }}
                >
                  {Array.isArray(fund.holdings) && fund.holdings.length ? (
                    <div className="list">
                      {fund.holdings.map((h, idx) => (
                        <div className="item" key={idx}>
                          <span className="name">{h.name}</span>
                          <div className="values">
                            {typeof h.change === 'number' && (
                              <span className={`badge ${h.change > 0 ? 'up' : h.change < 0 ? 'down' : ''}`} style={{ marginRight: 8 }}>
                                {h.change > 0 ? '+' : ''}{h.change.toFixed(2)}%
                              </span>
                            )}
                            <span className="weight">{h.weight}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="muted" style={{ padding: '8px 0' }}>暂无重仓数据</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </motion.div>
  );
}
