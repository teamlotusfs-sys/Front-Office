import React, { useState } from 'react';
import { useGame, formatSalary, ovrColor } from '../hooks/useGameState';

export default function FreeAgents() {
  const { gameState, signFreeAgent } = useGame();
  const { freeAgents, budget, roster } = gameState;
  const [posFilter, setPosFilter] = useState('All');
  const [sortBy, setSortBy] = useState('ovr');
  const [search, setSearch] = useState('');

  const positions = ['All', 'PG', 'SG', 'SF', 'PF', 'C'];

  const filtered = [...freeAgents]
    .filter(p => {
      const matchPos = posFilter === 'All' || p.pos === posFilter;
      const matchSearch = `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase());
      return matchPos && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'ovr') return b.ovr - a.ovr;
      if (sortBy === 'pot') return b.pot - a.pot;
      if (sortBy === 'age') return a.age - b.age;
      if (sortBy === 'salary') return a.salary - b.salary;
      return 0;
    });

  function canSign(player) {
    return budget >= player.salary && roster.length < 15;
  }

  return (
    <div>
      <h1 className="page-title">Free Agents</h1>
      <p className="page-subtitle">{freeAgents.length} available · Roster: {roster.length}/15 · Cap space: {formatSalary(budget)}</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search players..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', padding: '8px 14px', fontSize: 13, outline: 'none', width: 200 }}
        />
        <div style={{ display: 'flex', gap: 4 }}>
          {positions.map(pos => (
            <button key={pos} onClick={() => setPosFilter(pos)} style={{ background: posFilter === pos ? 'var(--accent-dim)' : 'var(--bg-card)', border: `1px solid ${posFilter === pos ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 4, color: posFilter === pos ? 'var(--accent)' : 'var(--text-secondary)', padding: '7px 12px', fontSize: 12, cursor: 'pointer' }}>
              {pos}
            </button>
          ))}
        </div>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>Sort:</span>
        {['ovr', 'pot', 'age', 'salary'].map(s => (
          <button key={s} onClick={() => setSortBy(s)} style={{ background: sortBy === s ? 'var(--accent-dim)' : 'var(--bg-card)', border: `1px solid ${sortBy === s ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 4, color: sortBy === s ? 'var(--accent)' : 'var(--text-secondary)', padding: '7px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'DM Mono, monospace', textTransform: 'uppercase' }}>
            {s}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Player</th><th>Pos</th><th>Age</th><th>OVR</th><th>POT</th>
              <th>PPG</th><th>RPG</th><th>APG</th><th>Ask/yr</th><th>Yrs</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ opacity: canSign(p) ? 1 : 0.5 }}>
                <td style={{ fontWeight: 500 }}>{p.firstName} {p.lastName}</td>
                <td><span className="badge badge-muted">{p.pos}</span></td>
                <td className="muted">{p.age}</td>
                <td><span style={{ fontFamily: 'DM Mono, monospace', fontWeight: 700, fontSize: 15, color: ovrColor(p.ovr) }}>{p.ovr}</span></td>
                <td className="mono muted">{p.pot}</td>
                <td className="mono">{p.stats.ppg}</td>
                <td className="mono">{p.stats.rpg}</td>
                <td className="mono">{p.stats.apg}</td>
                <td className="mono" style={{ fontSize: 12, color: p.salary > budget ? 'var(--red)' : 'inherit' }}>{formatSalary(p.salary)}</td>
                <td className="muted mono">{p.yearsLeft}yr</td>
                <td>
                  <button
                    className="action-btn success"
                    disabled={!canSign(p)}
                    onClick={() => signFreeAgent(p)}
                    title={!canSign(p) ? (roster.length >= 15 ? 'Roster full (15/15)' : 'Not enough cap space') : ''}
                  >
                    Sign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p style={{ padding: '20px', color: 'var(--text-secondary)', fontSize: 13, textAlign: 'center' }}>No players match.</p>
        )}
      </div>
    </div>
  );
}
