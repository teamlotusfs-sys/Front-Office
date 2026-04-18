import React, { useState } from 'react';
import { useGame, formatSalary, ovrColor } from '../hooks/useGameState';

export default function Roster() {
  const { gameState, releasePlayer } = useGame();
  const { roster, budget, playerStats } = gameState;
  const [sortBy, setSortBy] = useState('ovr');
  const [posFilter, setPosFilter] = useState('All');

  const positions = ['All', 'PG', 'SG', 'SF', 'PF', 'C'];

  // Calculate actual stats from playerStats
  const getRosterWithActualStats = () => {
    return roster.map(p => {
      const stats = playerStats[p.id];
      return {
        ...p,
        actualPPG: stats && stats.gamesPlayed > 0 ? stats.totalPoints / stats.gamesPlayed : 0,
        actualRPG: stats && stats.gamesPlayed > 0 ? stats.totalRebounds / stats.gamesPlayed : 0,
        actualAPG: stats && stats.gamesPlayed > 0 ? stats.totalAssists / stats.gamesPlayed : 0,
      };
    });
  };

  const rosterWithStats = getRosterWithActualStats();

  const sorted = [...rosterWithStats]
    .filter(p => posFilter === 'All' || p.pos === posFilter)
    .sort((a, b) => {
      if (sortBy === 'ovr') return b.ovr - a.ovr;
      if (sortBy === 'pot') return b.pot - a.pot;
      if (sortBy === 'age') return a.age - b.age;
      if (sortBy === 'salary') return b.salary - a.salary;
      if (sortBy === 'ppg') return b.actualPPG - a.actualPPG;
      return 0;
    });

  const totalSalary = roster.reduce((s, p) => s + p.salary, 0);

  return (
    <div>
      <h1 className="page-title">Roster</h1>
      <p className="page-subtitle">{roster.length} players · {formatSalary(totalSalary)} in salary · {formatSalary(budget)} cap space remaining</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {positions.map(pos => (
            <button 
              key={pos} 
              className={`conf-btn ${posFilter === pos ? 'active' : ''}`} 
              onClick={() => setPosFilter(pos)} 
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              {pos}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 8 }}>Sort by:</span>
        {['ovr', 'pot', 'age', 'salary', 'ppg'].map(s => (
          <button 
            key={s} 
            onClick={() => setSortBy(s)} 
            style={{ 
              background: sortBy === s ? 'var(--accent-dim)' : 'var(--bg-card)', 
              border: `1px solid ${sortBy === s ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 4,
              color: sortBy === s ? 'var(--accent)' : 'var(--text-secondary)',
              padding: '6px 12px',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {s.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Player</th>
              <th>Pos</th>
              <th>Age</th>
              <th>OVR</th>
              <th>POT</th>
              <th>PPG</th>
              <th>RPG</th>
              <th>APG</th>
              <th>Salary</th>
              <th>Yrs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 500 }}>{p.firstName} {p.lastName}</td>
                <td><span className="badge badge-muted">{p.pos}</span></td>
                <td className="muted">{p.age}</td>
                <td>
                  <span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 15, color: ovrColor(p.ovr) }}>{p.ovr}</span>
                </td>
                <td className="mono" style={{ color: 'var(--text-secondary)' }}>{p.pot}</td>
                <td className="mono" style={{ fontWeight: 600 }}>
                  {p.actualPPG > 0 ? p.actualPPG.toFixed(1) : '—'}
                </td>
                <td className="mono" style={{ fontWeight: 600 }}>
                  {p.actualRPG > 0 ? p.actualRPG.toFixed(1) : '—'}
                </td>
                <td className="mono" style={{ fontWeight: 600 }}>
                  {p.actualAPG > 0 ? p.actualAPG.toFixed(1) : '—'}
                </td>
                <td className="mono" style={{ fontSize: 12 }}>{formatSalary(p.salary)}</td>
                <td className="muted mono">{p.yearsLeft}yr</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="action-btn danger" onClick={() => {
                      if (window.confirm(`Release ${p.firstName} ${p.lastName}?`)) releasePlayer(p.id);
                    }}>Release</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && (
          <p style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>No players match this filter.</p>
        )}
      </div>
    </div>
  );
}
