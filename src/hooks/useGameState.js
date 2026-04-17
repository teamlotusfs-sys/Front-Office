import React, { createContext, useContext, useState, useCallback } from 'react';
import { NBA_TEAMS, generateRoster, generateSchedule, generateDraftPicks, generateFreeAgents } from '../data/nbaData';

const GameContext = createContext(null);

function random() {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967296;
  }
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    const hex = crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    return parseInt(hex, 16) / 4294967296;
  }
  throw new Error('Secure randomness is unavailable in this environment.');
}

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(null);

  const startGame = useCallback((teamId, gmName) => {
    const team = NBA_TEAMS.find(t => t.id === teamId);
    const allRosters = {};
    NBA_TEAMS.forEach(t => { allRosters[t.id] = generateRoster(t.id); });

    setGameState({
      team,
      gmName,
      season: 2025,
      week: 1,
      budget: 150_000_000,
      wins: 0,
      losses: 0,
      roster: allRosters[teamId],
      schedule: generateSchedule(teamId),
      draftPicks: generateDraftPicks(teamId),
      freeAgents: generateFreeAgents(40),
      allRosters,
      notifications: [
        { id: 1, type: 'info', text: `Welcome, GM ${gmName}! The ${team.name} rebuild starts now.`, read: false },
        { id: 2, type: 'info', text: 'Check the Free Agents tab to sign players.', read: false },
      ],
      morale: 72,
      chemistry: 65,
    });
  }, []);

  const signFreeAgent = useCallback((player) => {
    setGameState(prev => {
      if (!prev) return prev;
      const newNotif = { id: Date.now(), type: 'success', text: `Signed ${player.firstName} ${player.lastName} to a ${player.yearsLeft}-year deal.`, read: false };
      return {
        ...prev,
        roster: [...prev.roster, { ...player, teamId: prev.team.id }],
        freeAgents: prev.freeAgents.filter(p => p.id !== player.id),
        budget: prev.budget - player.salary,
        notifications: [newNotif, ...prev.notifications],
      };
    });
  }, []);

  const releasePlayer = useCallback((playerId) => {
    setGameState(prev => {
      if (!prev) return prev;
      const player = prev.roster.find(p => p.id === playerId);
      if (!player) return prev;
      const newNotif = { id: Date.now(), type: 'warning', text: `Released ${player.firstName} ${player.lastName}.`, read: false };
      return {
        ...prev,
        roster: prev.roster.filter(p => p.id !== playerId),
        budget: prev.budget + Math.round(player.salary * 0.3),
        notifications: [newNotif, ...prev.notifications],
      };
    });
  }, []);

  const markNotifRead = useCallback((id) => {
    setGameState(prev => {
      if (!prev) return prev;
      return { ...prev, notifications: prev.notifications.map(n => n.id === id ? { ...n, read: true } : n) };
    });
  }, []);

  const simulateGame = useCallback(() => {
    setGameState(prev => {
      if (!prev) return prev;
      const nextGame = prev.schedule.find(g => !g.played);
      if (!nextGame) return prev;
      const won = random() > 0.5;
      const score = { us: won ? 108 + Math.floor(random() * 15) : 95 + Math.floor(random() * 15), them: 0 };
      score.them = won ? score.us - 5 - Math.floor(random() * 15) : score.us + 5 + Math.floor(random() * 15);
      const result = `${won ? 'W' : 'L'} ${score.us}-${score.them} vs ${nextGame.opponent}`;
      const newNotif = { id: Date.now(), type: won ? 'success' : 'warning', text: result, read: false };
      return {
        ...prev,
        wins: won ? prev.wins + 1 : prev.wins,
        losses: !won ? prev.losses + 1 : prev.losses,
        week: prev.week + 1,
        schedule: prev.schedule.map(g => g.id === nextGame.id ? { ...g, played: true, won, score } : g),
        notifications: [newNotif, ...prev.notifications],
      };
    });
  }, []);

  return (
    <GameContext.Provider value={{ gameState, startGame, signFreeAgent, releasePlayer, markNotifRead, simulateGame }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

export function formatSalary(n) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export function ovrColor(ovr) {
  if (ovr >= 90) return '#e8ff47';
  if (ovr >= 80) return '#2ed573';
  if (ovr >= 70) return '#5352ed';
  if (ovr >= 60) return '#ffa502';
  return '#8888a8';
}
