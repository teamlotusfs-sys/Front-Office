import React from 'react';
import { NBA_TEAMS } from '../data/nbaData';

export default function Draft() {
  // Mock data - replace with actual gameState if needed
  const season = 2025;
  const draftPicks = [
    { year: 2025, round: 1, from: 'BOS', protected: null },
    { year: 2025, round: 2, from: 'GSW', protected: null },
    { year: 2026, round: 1, from: 'BOS', protected: 'Top-5' },
  ];

  return (
    <div>
      <h1 className="page-title">Draft Board</h1>
      <p className="page-subtitle">Your draft picks and scouting. Full draft board unlocked closer to the draft.</p>

      <div className="table-wrap" style={{ marginBottom: 24 }}>
        <div className="table-header">
          <span className="table-title">Your Draft Picks</span>
        </div>
        <table>
          <thead><tr><th>Year</th><th>Round</th><th>From</th><th>Protected</th><th>Status</th></tr></thead>
          <tbody>
            {draftPicks.map((pick, i) => {
              const team = NBA_TEAMS.find(t => t.id === pick.from);
              return (
                <tr key={i}>
                  <td style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 20, letterSpacing: '0.04em', color: pick.year === season ? 'var(--accent)' : 'inherit' }}>{pick.year}</td>
                  <td>
                    <span className={`badge ${pick.round === 1 ? 'badge-green' : 'badge-muted'}`}>
                      {pick.round === 1 ? '1st Round' : '2nd Round'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {team && <div style={{ width: 8, height: 8, borderRadius: '50%', background: team.color }} />}
                      <span style={{ fontSize: 13 }}>{team ? team.name : pick.from}</span>
                    </div>
                  </td>
                  <td>
                    {pick.protected ? (
                      <span className="badge badge-orange">{pick.protected}</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Unprotected</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${pick.year === season ? 'badge-green' : 'badge-muted'}`}>
                      {pick.year === season ? 'This Year' : `In ${pick.year - season} yr${pick.year - season !== 1 ? 's' : ''}`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="table-wrap">
        <div className="table-header">
          <span className="table-title">Draft Prospects</span>
          <span className="badge badge-orange">Scouting Opens Soon</span>
        </div>
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <p style={{ fontSize: 14, marginBottom: 6 }}>Draft scouting reports will be available closer to the {season} NBA Draft.</p>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Expand this section to add prospect profiles, scouting grades, and draft position projections.</p>
        </div>
      </div>
    </div>
  );
}
