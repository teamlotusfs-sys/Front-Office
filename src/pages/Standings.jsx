import React, { useState } from 'react';
import { useGame } from '../hooks/useGameState';
import { NBA_TEAMS } from '../data/nbaData';

export default function Standings() {
  const { gameState } = useGame();
  const { team, wins, losses } = gameState;
  const [conf, setConf] = useState('All');

  // Build standings with our real record injected
  const standings = NBA_TEAMS.map(t => {
    const [w, l] = t.record.split('-').map(Number);
    if (t.id === team.id) return { ...t, w: wins, l: losses, gb: 0 };
    return { ...t, w, l };
  }).filter(t => conf === 'All' || t.conf === conf)
    .sort((a, b) => {
      const pctA = a.w / (a.w + a.l) || 0;
      const pctB = b.w / (b.w + b.l) || 0;
      return pctB - pctA;
    })
    .map((t, i, arr) => {
      const leader = arr[0];
      const gb = ((leader.w - t.w) + (t.l - leader.l)) / 2;
      return { ...t, rank: i + 1, gb: gb > 0 ? gb.toFixed(1) : '—' };
    });

  return (
    <div>
      <h1 className="page-title">Standings</h1>
      <p className="page-subtitle">2025–26 Season · Your team is highlighted</p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {['All', 'East', 'West'].map(c => (
          <button key={c} onClick={() => setConf(c)}
            style={{ background: conf === c ? 'var(--accent-dim)' : 'var(--bg-card)', border: `1px solid ${conf === c ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 4, color: conf === c ? 'var(--accent)' : 'var(--text-secondary)', padding: '7px 16px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
            {c === 'All' ? 'All Teams' : `${c}ern Conference`}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Team</th><th>Conf</th><th>W</th><th>L</th><th>PCT</th><th>GB</th><th>OVR</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(t => {
              const isMyTeam = t.id === team.id;
              const pct = t.w + t.l > 0 ? (t.w / (t.w + t.l)).toFixed(3) : '.000';
              const inPlayoffs = t.rank <= (conf === 'All' ? 16 : 8);
              return (
                <tr key={t.id} style={isMyTeam ? { background: 'rgba(232,255,71,0.08)', outline: '1px solid var(--accent)', outlineOffset: '-1px' } : {}}>
                  <td className="mono muted" style={{ fontSize: 13 }}>
                    {t.rank <= (conf === 'All' ? 16 : 8) && <span style={{ color: 'var(--green)', marginRight: 4, fontSize: 10 }}>●</span>}
                    {t.rank}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: isMyTeam ? 700 : 400, color: isMyTeam ? 'var(--accent)' : 'inherit' }}>
                        {t.abbr}
                        {isMyTeam && <span style={{ fontSize: 10, marginLeft: 6, color: 'var(--accent)', fontFamily: 'DM Mono, monospace' }}>YOU</span>}
                      </span>
                    </div>
                  </td>
                  <td><span className="badge badge-muted">{t.conf}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--green)', fontFamily: 'DM Mono, monospace' }}>{t.w}</td>
                  <td style={{ fontWeight: 600, color: 'var(--red)', fontFamily: 'DM Mono, monospace' }}>{t.l}</td>
                  <td className="mono">{pct}</td>
                  <td className="mono muted">{t.gb}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ height: 4, width: 50, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${((t.rating - 55) / 45) * 100}%`, background: t.rating >= 80 ? 'var(--accent)' : t.rating >= 70 ? 'var(--green)' : 'var(--orange)', borderRadius: 2 }} />
                      </div>
                      <span className="mono" style={{ fontSize: 12 }}>{t.rating}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, fontFamily: 'DM Mono, monospace' }}>
        ● = Playoff position (top {conf === 'All' ? 16 : 8})
      </p>
    </div>
  );
}
