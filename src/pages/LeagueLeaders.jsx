import React, { useState } from 'react';
import { useGame, ovrColor } from '../hooks/useGameState';
import './LeagueLeaders.css';

export default function LeagueLeaders() {
  const { gameState } = useGame();
  const [activeCategory, setActiveCategory] = useState('ppg');

  if (!gameState) {
    return <div className="page-title">Loading...</div>;
  }

  const { allRosters, playerStats, team } = gameState;

  // Combine all players from all teams with their stats
  const allPlayers = [];
  Object.keys(allRosters).forEach(teamId => {
    const teamRoster = allRosters[teamId];

    teamRoster.forEach(player => {
      const stats = playerStats[player.id];
      if (stats && stats.gamesPlayed > 0) {
        const ppg = (stats.totalPoints / stats.gamesPlayed).toFixed(1);
        const rpg = (stats.totalRebounds / stats.gamesPlayed).toFixed(1);
        const apg = (stats.totalAssists / stats.gamesPlayed).toFixed(1);
        const spg = (stats.totalSteals / stats.gamesPlayed).toFixed(1);
        const bpg = (stats.totalBlocks / stats.gamesPlayed).toFixed(1);

        // Calculate shooting percentages
        const fgPct = stats.totalFGA > 0 ? ((stats.totalFGM / stats.totalFGA) * 100).toFixed(1) : '0.0';
        const fg3Pct = stats.totalTPA > 0 ? ((stats.totalTPM / stats.totalTPA) * 100).toFixed(1) : '0.0';
        const ftPct = stats.totalFTA > 0 ? ((stats.totalFTM / stats.totalFTA) * 100).toFixed(1) : '0.0';

        // Only include players with minimum attempts for shooting percentages
        const minFGA = stats.totalFGA >= stats.gamesPlayed * 5; // At least 5 FGA per game
        const min3PA = stats.totalTPA >= stats.gamesPlayed * 2; // At least 2 3PA per game
        const minFTA = stats.totalFTA >= stats.gamesPlayed * 2; // At least 2 FTA per game

        allPlayers.push({
          ...player,
          teamAbbr: teamId,
          gamesPlayed: stats.gamesPlayed,
          ppg: parseFloat(ppg),
          rpg: parseFloat(rpg),
          apg: parseFloat(apg),
          spg: parseFloat(spg),
          bpg: parseFloat(bpg),
          fgPct: minFGA ? parseFloat(fgPct) : null,
          fg3Pct: min3PA ? parseFloat(fg3Pct) : null,
          ftPct: minFTA ? parseFloat(ftPct) : null,
          // For display
          ppgDisplay: ppg,
          rpgDisplay: rpg,
          apgDisplay: apg,
          spgDisplay: spg,
          bpgDisplay: bpg,
          fgPctDisplay: minFGA ? fgPct + '%' : '-',
          fg3PctDisplay: min3PA ? fg3Pct + '%' : '-',
          ftPctDisplay: minFTA ? ftPct + '%' : '-',
        });
      }
    });
  });

  const categories = [
    { id: 'ppg', label: 'Points', icon: '🔥' },
    { id: 'rpg', label: 'Rebounds', icon: '🏀' },
    { id: 'apg', label: 'Assists', icon: '🎯' },
    { id: 'spg', label: 'Steals', icon: '🦅' },
    { id: 'bpg', label: 'Blocks', icon: '🛡️' },
    { id: 'fgPct', label: 'FG%', icon: '🎪' },
    { id: 'fg3Pct', label: '3P%', icon: '💫' },
    { id: 'ftPct', label: 'FT%', icon: '🎯' },
  ];

  // Sort by active category (filter out nulls for percentage stats)
  const sortedLeaders = [...allPlayers]
    .filter(p => {
      // For percentage categories, only show players who qualify
      if (activeCategory === 'fgPct') return p.fgPct !== null;
      if (activeCategory === 'fg3Pct') return p.fg3Pct !== null;
      if (activeCategory === 'ftPct') return p.ftPct !== null;
      return true;
    })
    .sort((a, b) => {
      const aVal = a[activeCategory];
      const bVal = b[activeCategory];
      return bVal - aVal;
    })
    .slice(0, 50); // Top 50

  const getPositionColor = (pos) => {
    const colors = {
      'PG': '#5352ed',
      'SG': '#3742fa',
      'SF': '#2ed573',
      'PF': '#ffa502',
      'C': '#ff4757',
    };
    return colors[pos] || '#8888a8';
  };

  return (
    <div className="leaders-page">
      <div className="leaders-header">
        <div>
          <h1 className="page-title">League Leaders</h1>
          <p className="page-subtitle">Top performers across the NBA</p>
        </div>
      </div>

      <div className="category-tabs">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="category-icon">{cat.icon}</span>
            <span className="category-label">{cat.label}</span>
          </button>
        ))}
      </div>

      <div className="leaders-container">
        <div className="leaders-table-wrapper">
          <table className="leaders-table">
            <thead>
              <tr>
                <th className="rank-col">Rank</th>
                <th className="player-col">Player</th>
                <th className="team-col">Team</th>
                <th className="pos-col">Pos</th>
                <th className="ovr-col">OVR</th>
                <th className="stat-col">PPG</th>
                <th className="stat-col">RPG</th>
                <th className="stat-col">APG</th>
                <th className="stat-col">SPG</th>
                <th className="stat-col">BPG</th>
                <th className="stat-col">FG%</th>
                <th className="stat-col">3P%</th>
                <th className="stat-col">FT%</th>
                <th className="stat-col">GP</th>
              </tr>
            </thead>
            <tbody>
              {sortedLeaders.map((player, index) => {
                const isYourPlayer = player.teamAbbr === team.id;
                return (
                  <tr key={`${player.id}-${index}`} className={isYourPlayer ? 'your-player' : ''}>
                    <td className="rank-col">
                      <div className="rank-badge" data-rank={index + 1}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="player-col">
                      <div className="player-name-cell">
                        <span className="player-name">
                          {player.firstName} {player.lastName}
                        </span>
                        {isYourPlayer && <span className="your-team-badge">YOUR TEAM</span>}
                      </div>
                    </td>
                    <td className="team-col">
                      <span className="team-badge">{player.teamAbbr}</span>
                    </td>
                    <td className="pos-col">
                      <span className="pos-badge" style={{ background: getPositionColor(player.pos) }}>
                        {player.pos}
                      </span>
                    </td>
                    <td className="ovr-col">
                      <span className="ovr-value" style={{ color: ovrColor(player.ovr) }}>
                        {player.ovr}
                      </span>
                    </td>
                    <td className={`stat-col ${activeCategory === 'ppg' ? 'highlight' : ''}`}>
                      {player.ppgDisplay}
                    </td>
                    <td className={`stat-col ${activeCategory === 'rpg' ? 'highlight' : ''}`}>
                      {player.rpgDisplay}
                    </td>
                    <td className={`stat-col ${activeCategory === 'apg' ? 'highlight' : ''}`}>
                      {player.apgDisplay}
                    </td>
                    <td className={`stat-col ${activeCategory === 'spg' ? 'highlight' : ''}`}>
                      {player.spgDisplay}
                    </td>
                    <td className={`stat-col ${activeCategory === 'bpg' ? 'highlight' : ''}`}>
                      {player.bpgDisplay}
                    </td>
                    <td className={`stat-col ${activeCategory === 'fgPct' ? 'highlight' : ''}`}>
                      {player.fgPctDisplay}
                    </td>
                    <td className={`stat-col ${activeCategory === 'fg3Pct' ? 'highlight' : ''}`}>
                      {player.fg3PctDisplay}
                    </td>
                    <td className={`stat-col ${activeCategory === 'ftPct' ? 'highlight' : ''}`}>
                      {player.ftPctDisplay}
                    </td>
                    <td className="stat-col">
                      {player.gamesPlayed}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedLeaders.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-text">No games played yet</div>
            <div className="empty-subtext">Simulate some games to see league leaders</div>
          </div>
        )}
      </div>
    </div>
  );
}
