import React, { useState } from 'react';
import { useGame } from '../hooks/useGameState';
import { NBA_TEAMS } from '../data/nbaData';

export default function Standings() {
  const { gameState } = useGame();
  const { team, wins, losses, schedule } = gameState;
  const [conf, setConf] = useState('All');

  // Calculate wins/losses for all teams from their rosters in schedule
  const teamRecords = {};
  NBA_TEAMS.forEach(t => {
    teamRecords[t.id] = { w: 0, l: 0 };
  });

  // Count played games
  schedule.forEach(g => {
    const opponent = NBA_TEAMS.find(t => t.abbr === g.opponent);
    if (g.played && opponent) {
      if (g.won) {
        // Your team won
        teamRecords[team.id].w++;
        teamRecords[opponent.id].l++;
      } else {
        // Your team lost
        teamRecords[team.id].l++;
        teamRecords[opponent.id].w++;
      }
    }
  });

  // Override your team with actual state
  teamRecords[team.id] = { w: wins, l: losses };

  // Build standings
  const allStandings = NBA_TEAMS.map(t => ({
    ...t,
    w: teamRecords[t.id].w,
    l: teamRecords[t.id].l,
  }));

  // Filter by conference
  const filtered = allStandings.filter(t => conf === 'All' || t.conf === conf);

  // Sort by win percentage
  const sorted = filtered.sort((a, b) => {
    const pctA = a.w / (a.w + a.l) || 0;
    const pctB = b.w / (b.w + b.l) || 0;
    return pctB - pctA;
  });

  // Add rank and games behind
  const standings = sorted.map((t, i) => {
    const leader = sorted[0];
    const leaderWins = leader.w;
    const leaderLosses = leader.l;
    const gb = leaderWins === t.w && leaderLosses === t.l 
      ? '—' 
      : ((leaderWins - t.w) + (t.l - leaderLosses)) / 2;
    return { ...t, rank: i + 1, gb: typeof gb === 'number' ? gb.toFixed(1) : gb };
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
              transition: 'all 0.15s'
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
              <th>#</th><th>Team</th><th>Conf</th><th>W</th><th>L</th><th>PCT</th><th>GB</th><th>OVR</th>
            </tr>
          </thead>
          <tbody>
            {standings.map(t => {
              const isMyTeam = t.id === team.id;
              const pct = t.w + t.l > 0 ? (t.w / (t.w + t.l)).toFixed(3) : '.000';
              const isPlayoff = t.rank <= (conf === 'All' ? 16 : 8);

              return (
                <tr
                  key={t.id}
                  style={isMyTeam ? { background: 'rgba(232,255,71,0.08)', outline: '1px solid var(--accent)', outlineOffset: '-1px' } : {}}
                >
                  <td className="mono muted" style={{ fontSize: 13 }}>
                    {isPlayoff && <span style={{ color: 'var(--green)', marginRight: 4, fontSize: 10 }}>●</span>}
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
                        <div
                          style={{
                            height: '100%',
                            width: `${((t.rating - 55) / 45) * 100}%`,
                            background: t.rating >= 80 ? 'var(--accent)' : t.rating >= 70 ? 'var(--green)' : 'var(--orange)',
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
      <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, fontFamily: 'DM Mono, monospace' }}>
        ● = Playoff position (top {conf === 'All' ? 16 : 8})
      </p>
    </div>
  );
}
