import React, { useState } from 'react';
import { useGame } from '../hooks/useGameState';
import { NBA_TEAMS } from '../data/nbaData';
import './Standings.css';

export default function Standings() {
  const { gameState } = useGame();
  const { team, teamRecords } = gameState;
  const [conf, setConf] = useState('All');

  // Build standings from team records
  const allStandings = NBA_TEAMS.map(t => ({
    ...t,
    w: teamRecords[t.id].w,
    l: teamRecords[t.id].l,
    pf: teamRecords[t.id].pf,
    pa: teamRecords[t.id].pa,
  }));

  // Filter by conference
  const filtered = allStandings.filter(t => conf === 'All' || t.conf === conf);

  // Sort by win percentage
  const sorted = filtered.sort((a, b) => {
    const pctA = a.w / (a.w + a.l) || 0;
    const pctB = b.w / (b.w + b.l) || 0;
    if (pctB !== pctA) return pctB - pctA;
    // Tiebreaker: head to head, then point differential
    return (b.pf - b.pa) - (a.pf - a.pa);
  });

  // Add rank and games behind
  const standings = sorted.map((t, i) => {
    const leader = sorted[0];
    const leaderWins = leader.w;
    const leaderLosses = leader.l;
    const gb = leaderWins === t.w && leaderLosses === t.l 
      ? '—' 
      : ((leaderWins - t.w) + (t.l - leaderLosses)) / 2;
    return { 
      ...t, 
      rank: i + 1, 
      gb: typeof gb === 'number' ? gb.toFixed(1) : gb,
      pct: t.w + t.l > 0 ? (t.w / (t.w + t.l)).toFixed(3) : '.000',
      diff: t.pf - t.pa,
    };
  });

  return (
    <div>
      <h1 className="page-title">Standings</h1>
      <p className="page-subtitle">2025–26 Season · Your team is highlighted</p>

      <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
        {['All', 'East', 'West'].map(c => (
          <button
            key={c}
            onClick={() => setConf(c)}
            style={{
              background: conf === c ? 'var(--accent-dim)' : 'var(--bg-card)',
              border: `1px solid ${conf === c ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 4,
              color: conf === c ? 'var(--accent)' : 'var(--text-secondary)',
              padding: '7px 14px',
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontWeight: 600,
            }}
          >
            {c === 'All' ? 'All Teams' : `${c}ern Conference`}
          </button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>W</th>
              <th>L</th>
              <th>PCT</th>
              <th>GB</th>
              <th>PF</th>
              <th>PA</th>
              <th>DIFF</th>
              <th>OVR</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(t => {
              const isMyTeam = t.id === team.id;
              const isPlayoff = t.rank <= (conf === 'All' ? 16 : 8);

              return (
                <tr
                  key={t.id}
                  style={isMyTeam ? { background: 'rgba(232,255,71,0.08)', outline: '1px solid var(--accent)', outlineOffset: '-1px' } : {}}
                >
                  <td className="mono muted" style={{ fontSize: 13, fontWeight: 700 }}>
                    {isPlayoff && <span style={{ color: 'var(--green)', marginRight: 4, fontSize: 10 }}>●</span>}
                    {t.rank}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: isMyTeam ? 700 : 400, color: isMyTeam ? 'var(--accent)' : 'inherit' }}>
                        {t.abbr}
                        {isMyTeam && <span style={{ fontSize: 10, marginLeft: 6, color: 'var(--accent)', fontFamily: 'Space Mono, monospace' }}>YOU</span>}
                      </span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--green)', fontFamily: 'Space Mono, monospace' }}>{t.w}</td>
                  <td style={{ fontWeight: 600, color: 'var(--red)', fontFamily: 'Space Mono, monospace' }}>{t.l}</td>
                  <td className="mono" style={{ fontSize: 12, fontWeight: 600 }}>{t.pct}</td>
                  <td className="mono muted" style={{ fontSize: 12 }}>{t.gb}</td>
                  <td className="mono" style={{ fontSize: 12, fontFamily: 'Space Mono, monospace' }}>{t.pf}</td>
                  <td className="mono" style={{ fontSize: 12, fontFamily: 'Space Mono, monospace' }}>{t.pa}</td>
                  <td className="mono" style={{ fontSize: 12, fontWeight: 600, color: t.diff > 0 ? 'var(--green)' : t.diff < 0 ? 'var(--red)' : 'var(--text-secondary)', fontFamily: 'Space Mono, monospace' }}>
                    {t.diff > 0 ? '+' : ''}{t.diff}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ height: 4, width: 40, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: `${((t.rating - 55) / 45) * 100}%`,
                            background: t.rating >= 85 ? 'var(--accent)' : t.rating >= 75 ? 'var(--green)' : 'var(--orange)',
                            borderRadius: 2
                          }}
                        />
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
      <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 10, fontFamily: 'Space Mono, monospace' }}>
        ● = Playoff position (top {conf === 'All' ? 16 : 8}) | PF = Points For | PA = Points Against | DIFF = Point Differential
      </p>
    </div>
  );
}
