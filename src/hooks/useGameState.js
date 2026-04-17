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

// Helper to parse date string "Oct 15" to comparable format
function parseDate(dateStr) {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const [month, day] = dateStr.split(' ');
  const monthIndex = months.indexOf(month);
  return monthIndex * 100 + parseInt(day);
}

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(null);

  const startGame = useCallback((teamId, gmName) => {
    const team = NBA_TEAMS.find(t => t.id === teamId);
    const allRosters = {};
    const allSchedules = {};
    
    NBA_TEAMS.forEach(t => { 
      allRosters[t.id] = generateRoster(t.id);
      allSchedules[t.id] = generateSchedule(t.id);
    });

    setGameState({
      team,
      gmName,
      season: 2025,
      week: 1,
      budget: 150_000_000,
      wins: 0,
      losses: 0,
      roster: allRosters[teamId],
      schedule: allSchedules[teamId],
      allSchedules,
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
      
      // Find next unplayed game by date order for YOUR team
      const unplayedGames = prev.schedule.filter(g => !g.played);
      if (!unplayedGames.length) return prev;
      
      const nextGame = unplayedGames.sort((a, b) => parseDate(a.date) - parseDate(b.date))[0];
      
      // Simulate YOUR game with team ratings
      const yourTeam = prev.team;
      const opponent = NBA_TEAMS.find(t => t.abbr === nextGame.opponent);
      
      // Home court advantage: +3 rating points
      const adjustedRating = yourTeam.rating + (nextGame.isHome ? 3 : -3);
      const adjustedOppRating = opponent.rating - (nextGame.isHome ? 3 : -3);
      
      // Calculate win probability
      const totalRating = adjustedRating + adjustedOppRating;
      const winProbability = adjustedRating / totalRating;
      
      // Add randomness - better teams win more but upsets still possible
      const won = random() < winProbability;
      const score = { us: won ? 108 + Math.floor(random() * 15) : 95 + Math.floor(random() * 15), them: 0 };
      score.them = won ? score.us - 5 - Math.floor(random() * 15) : score.us + 5 + Math.floor(random() * 15);
      
      const result = `${won ? 'W' : 'L'} ${score.us}-${score.them} vs ${nextGame.opponent}`;
      const newNotif = { id: Date.now(), type: won ? 'success' : 'warning', text: result, read: false };
      
      // Also simulate OTHER teams' unplayed games on the same day
      const gameDate = nextGame.date;
      const newAllSchedules = { ...prev.allSchedules };
      
      NBA_TEAMS.forEach(team => {
        if (team.id !== prev.team.id) {
          const teamSchedule = newAllSchedules[team.id];
          const gamesOnSameDay = teamSchedule.filter(g => g.date === gameDate && !g.played);
          
          gamesOnSameDay.forEach(game => {
            const oppTeam = NBA_TEAMS.find(t => t.abbr === game.opponent);
            
            const teamRating = team.rating;
            const oppTeamRating = oppTeam.rating;
            const adjustedTeamRating = teamRating + (game.isHome ? 3 : -3);
            const adjustedOppTeamRating = oppTeamRating - (game.isHome ? 3 : -3);
            
            const totalTeamRating = adjustedTeamRating + adjustedOppTeamRating;
            const teamWinProb = adjustedTeamRating / totalTeamRating;
            const teamWon = random() < teamWinProb;
            
            const teamScore = { 
              us: teamWon ? 108 + Math.floor(random() * 15) : 95 + Math.floor(random() * 15), 
              them: 0 
            };
            teamScore.them = teamWon ? teamScore.us - 5 - Math.floor(random() * 15) : teamScore.us + 5 + Math.floor(random() * 15);
            
            // Update the schedule for this team
            newAllSchedules[team.id] = teamSchedule.map(g => 
              g.id === game.id ? { ...g, played: true, won: teamWon, score: teamScore } : g
            );
          });
        }
      });
      
      return {
        ...prev,
        wins: won ? prev.wins + 1 : prev.wins,
        losses: !won ? prev.losses + 1 : prev.losses,
        week: prev.week + 1,
        schedule: prev.schedule.map(g => g.id === nextGame.id ? { ...g, played: true, won, score } : g),
        allSchedules: newAllSchedules,
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
