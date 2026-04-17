import React, { useState } from 'react';
import { useGame, formatSalary, ovrColor } from '../hooks/useGameState';
import { NBA_TEAMS } from '../data/nbaData';

export default function Trades() {
  const { gameState } = useGame();
  const { roster, allRosters } = gameState;
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [mySelected, setMySelected] = useState([]);
  const [theirSelected, setTheirSelected] = useState([]);

  const otherTeams = NBA_TEAMS.filter(t => t.id !== gameState.team.id);
  const theirRoster = selectedTeam ? (allRosters[selectedTeam.id] || []) : [];

  function toggleMine(id) {
    setMySelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleTheirs(id) {
    setTheirSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const mySalary = mySelected.reduce((s, id) => s + (roster.find(p => p.id === id)?.salary || 0), 0);
  const theirSalary = theirSelected.reduce((s, id) => s + (theirRoster.find(p => p.id === id)?.salary || 0), 0);
  const canPropose = mySelected.length > 0 && theirSelected.length > 0;

  return (
    <div>
      <h1 className="page-title">Trade Center</h1>
      <p className="page-subtitle">Select a team, pick players from both sides, and propose a trade.</p>

      <div style={{ display: 'flex', gap: 20, marginBottom: 20 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Trade With</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 6, maxHeight: 220, overflowY: 'auto' }}>
            {otherTeams.map(t => (
              <button key={t.id} onClick={() => { setSelectedTeam(t); setTheirSelected([]); }}
                style={{ background: selectedTeam?.id === t.id ? 'var(--accent-dim)' : 'var(--bg-card)', border: `1px solid ${selectedTeam?.id === t.id ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 6, padding: '8px 6px', cursor: 'pointer', transition: 'all 0.12s' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, margin: '0 auto 4px' }} />
                <div style={{ fontFamily: 'Bebas Neue, sans-serif', fontSize: 16, letterSpacing: '0.04em', color: selectedTeam?.id === t.id ? 'var(--accent)' : 'var(--text-primary)' }}>{t.abbr}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedTeam && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 20, alignItems: 'flex-start' }}>
            {/* My side */}
            <div className="table-wrap">
              <div className="table-header">
                <span className="table-title">Your Players</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{mySelected.length} selected · {formatSalary(mySalary)}</span>
              </div>
              <table>
                <thead><tr><th>✓</th><th>Player</th><th>Pos</th><th>OVR</th><th>Salary</th></tr></thead>
                <tbody>
                  {roster.map(p => (
                    <tr key={p.id} onClick={() => toggleMine(p.id)} style={{ cursor: 'pointer', background: mySelected.includes(p.id) ? 'rgba(232,255,71,0.07)' : '' }}>
                      <td><input type="checkbox" checked={mySelected.includes(p.id)} onChange={() => toggleMine(p.id)} style={{ cursor: 'pointer' }} /></td>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{p.firstName} {p.lastName}</td>
                      <td><span className="badge badge-muted">{p.pos}</span></td>
                      <td style={{ color: ovrColor(p.ovr), fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>{p.ovr}</td>
                      <td className="mono" style={{ fontSize: 12 }}>{formatSalary(p.salary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 80 }}>
              <span style={{ fontSize: 28, opacity: 0.4 }}>⇄</span>
              <button
                className="action-btn success"
                disabled={!canPropose}
                onClick={() => alert('Trade logic coming soon! You can wire this up to your game state.')}
                style={{ fontSize: 13, padding: '10px 16px', opacity: canPropose ? 1 : 0.4 }}
              >
                Propose
              </button>
              {canPropose && (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.5 }}>
                  <div>You send: {formatSalary(mySalary)}</div>
                  <div>They send: {formatSalary(theirSalary)}</div>
                  <div style={{ color: Math.abs(mySalary - theirSalary) < 5_000_000 ? 'var(--green)' : 'var(--orange)', marginTop: 4 }}>
                    {Math.abs(mySalary - theirSalary) < 5_000_000 ? '✓ Balanced' : '⚠ Imbalanced'}
                  </div>
                </div>
              )}
            </div>

            {/* Their side */}
            <div className="table-wrap">
              <div className="table-header">
                <span className="table-title">{selectedTeam.name}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{theirSelected.length} selected · {formatSalary(theirSalary)}</span>
              </div>
              <table>
                <thead><tr><th>✓</th><th>Player</th><th>Pos</th><th>OVR</th><th>Salary</th></tr></thead>
                <tbody>
                  {theirRoster.map(p => (
                    <tr key={p.id} onClick={() => toggleTheirs(p.id)} style={{ cursor: 'pointer', background: theirSelected.includes(p.id) ? 'rgba(232,255,71,0.07)' : '' }}>
                      <td><input type="checkbox" checked={theirSelected.includes(p.id)} onChange={() => toggleTheirs(p.id)} style={{ cursor: 'pointer' }} /></td>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{p.firstName} {p.lastName}</td>
                      <td><span className="badge badge-muted">{p.pos}</span></td>
                      <td style={{ color: ovrColor(p.ovr), fontFamily: 'DM Mono, monospace', fontWeight: 700 }}>{p.ovr}</td>
                      <td className="mono" style={{ fontSize: 12 }}>{formatSalary(p.salary)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!selectedTeam && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
          <p>Select a team above to start building a trade.</p>
        </div>
      )}
    </div>
  );
}
