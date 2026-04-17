import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useGame, formatSalary } from '../hooks/useGameState';
import './GameLayout.css';

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/roster', icon: '👥', label: 'Roster' },
  { to: '/trades', icon: '🔄', label: 'Trades' },
  { to: '/free-agents', icon: '✍️', label: 'Free Agents' },
  { to: '/schedule', icon: '📅', label: 'Schedule' },
  { to: '/draft', icon: '🎯', label: 'Draft' },
  { to: '/standings', icon: '🏆', label: 'Standings' },
];

export default function GameLayout() {
  const { gameState, simulateGame, markNotifRead } = useGame();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);

  if (!gameState) { navigate('/'); return null; }

  const { team, gmName, wins, losses, season, week, budget, notifications } = gameState;
  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo">🏀</span>
          <span className="sidebar-app-name">REBUILD<span className="accent">MODE</span></span>
        </div>

        <div className="sidebar-team">
          <div className="team-dot" style={{ background: team.color }} />
          <div>
            <div className="sidebar-team-abbr">{team.abbr}</div>
            <div className="sidebar-team-name">{team.name}</div>
          </div>
        </div>

        <div className="sidebar-record">
          <span className="record-wins">{wins}W</span>
          <span className="record-dash">–</span>
          <span className="record-losses">{losses}L</span>
          <span className="record-season muted">· {season}</span>
        </div>

        <nav className="sidebar-nav">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="budget-row">
            <span className="muted" style={{fontSize:11}}>CAP SPACE</span>
            <span className="mono" style={{fontSize:13, color: budget < 20_000_000 ? 'var(--red)' : 'var(--green)'}}>{formatSalary(budget)}</span>
          </div>
          <div className="budget-row" style={{marginTop:4}}>
            <span className="muted" style={{fontSize:11}}>GM</span>
            <span style={{fontSize:12}}>{gmName}</span>
          </div>
          <button className="sim-btn" onClick={simulateGame}>
            ▶ Sim Next Game
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-area">
        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-left">
            <span className="topbar-label muted">WEEK</span>
            <span className="topbar-val mono">{week}</span>
          </div>
          <div className="topbar-right">
            <div className="notif-btn-wrap">
              <button className="notif-btn" onClick={() => setShowNotifs(v => !v)}>
                🔔
                {unread > 0 && <span className="notif-dot">{unread}</span>}
              </button>
              {showNotifs && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notifications</span>
                    <button className="notif-clear" onClick={() => notifications.forEach(n => markNotifRead(n.id))}>Clear all</button>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 && <p className="muted" style={{padding:'12px 16px',fontSize:13}}>No notifications.</p>}
                    {notifications.map(n => (
                      <div key={n.id} className={`notif-item ${n.read ? 'read' : ''} notif-${n.type}`} onClick={() => markNotifRead(n.id)}>
                        <span className="notif-dot-type" />
                        <span>{n.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
