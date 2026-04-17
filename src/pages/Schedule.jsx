import React, { useState } from 'react';
import { useGame } from '../hooks/useGameState';

export default function Schedule() {
  const { gameState, simulateGame } = useGame();
  const { schedule, wins, losses } = gameState;
  const [filter, setFilter] = useState('all');

  const filtered = schedule.filter(g => {
    if (filter === 'played') return g.played;
    if (filter === 'upcoming') return !g.played;
    return true;
  });

  const winStreak = (() => {
    const played = schedule.filter(g => g.played).reverse();
    if (!played.length) return { count: 0, type: null };
    const type = played[0].won;
    let count = 0;
    for (const g of played) { if (g.won === type) count++; else break; }
    return { count, type };
  })();

  return (
    <div>
      <h1 className="page-title">Schedule</h1>
      <p className="page-subtitle">
        {wins}W–{losses}L ·{' '}
        {winStreak.count > 1 && <span style={{ color: winStreak.type ? 'var(--green)' : 'var(--red)' }}>{winStreak.count}-game {winStreak.type ? 'win' : 'losing'} streak · </span>}
        {schedule.filter(g => !g.played).length} games remaining
      </p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center' }}>
        {['all', 'played', 'upcoming'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? 'var(--accent-dim)' : 'var(--bg-card)', border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 4, color: filter === f ? 'var(--accent)' : 'var(--text-secondary)', padding: '7px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>
            {f === 'all' ? 'All Games' : f === 'played' ? 'Results' : 'Upcoming'}
          </button>
        ))}
        <button className="action-btn success" onClick={simulateGame} style={{ marginLeft: 'auto' }}>▶ Sim Next</button>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Date</th><th>Matchup</th><th>Home/Away</th><th>Result</th><th>Score</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((g, i) => {
              const isNext = !g.played && schedule.findIndex(x => !x.played) === schedule.indexOf(g);
              return (
                <tr key={g.id} style={isNext ? { background: 'rgba(232,255,71,0.05)', outline: '1px solid var(--accent)' } : {}}>
                  <td className="muted mono" style={{ fontSize: 11 }}>{schedule.indexOf(g) + 1}</td>
                  <td className="muted" style={{ fontSize: 12 }}>{g.date}</td>
                  <td style={{ fontWeight: isNext ? 600 : 400 }}>
                    {isNext && <span style={{ fontSize: 10, color: 'var(--accent)', fontFamily: 'DM Mono, monospace', marginRight: 6 }}>NEXT ▶</span>}
                    {g.isHome ? 'vs' : '@'} {g.oppName}
                  </td>
                  <td><span className="badge badge-muted">{g.isHome ? 'HOME' : 'AWAY'}</span></td>
                  <td>
                    {g.played ? (
                      <span className={`badge ${g.won ? 'badge-green' : 'badge-red'}`}>{g.won ? 'W' : 'L'}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                    )}
                  </td>
                  <td className="mono" style={{ fontSize: 13 }}>
                    {g.played ? `${g.score.us}–${g.score.them}` : '—'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
