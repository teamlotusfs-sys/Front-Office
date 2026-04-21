import React, { createContext, useContext, useState, useCallback } from 'react';
import { NBA_TEAMS, generateRoster, generateSchedule, generateDraftPicks, generateFreeAgents } from '../data/nbaData';
import { generatePlayerGameStats } from '../data/playerStatsHelpers';

const GameContext = createContext(null);

const TOTAL_SALARY_CAP = 150_000_000; // $150M cap (2024-25 actual)

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

function parseDate(dateStr) {
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
  const [month, day] = dateStr.split(' ');
  const monthIndex = months.indexOf(month);
  return monthIndex * 100 + parseInt(day);
}

function calculateAvailableCap(roster) {
  const usedCap = roster.reduce((sum, player) => sum + player.salary, 0);
  return Math.max(0, TOTAL_SALARY_CAP - usedCap);
}

function playBuzzer() {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (e) {
    // Audio not available
  }
}

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(null);
  const [gameAnimation, setGameAnimation] = useState(null);

  const startGame = useCallback((teamId, gmName) => {
    const team = NBA_TEAMS.find(t => t.id === teamId);
    const allRosters = {};
    const allSchedules = {};
    const teamRecords = {};
    
    NBA_TEAMS.forEach(t => { 
      allRosters[t.id] = generateRoster(t.id);
      allSchedules[t.id] = generateSchedule(t.id);
      teamRecords[t.id] = { w: 0, l: 0, pf: 0, pa: 0 }; // Points For/Against
    });

    const playerStats = {};
    NBA_TEAMS.forEach(t => {
      allRosters[t.id].forEach(player => {
        playerStats[player.id] = {
          gamesPlayed: 0,
          totalPoints: 0,
          totalRebounds: 0,
          totalAssists: 0,
          totalSteals: 0,
          totalBlocks: 0,
          gameLog: [],
        };
      });
    });

    const initialRoster = allRosters[teamId];

    setGameState({
      team,
      gmName,
      season: 2025,
      week: 1,
      budget: calculateAvailableCap(initialRoster),
      wins: 0,
      losses: 0,
      roster: initialRoster,
      schedule: allSchedules[teamId],
      allSchedules,
      teamRecords, // Track wins/losses for all teams
      draftPicks: generateDraftPicks(teamId),
      freeAgents: generateFreeAgents(40),
      allRosters,
      playerStats,
      tradeHistory: [],
      rotations: {
        starters: Array(5).fill(null),
        bench: Array(8).fill(null),
        minutesAlloc: {},
      },
      notifications: [
        { id: 1, type: 'info', text: `Welcome, GM ${gmName}! The ${team.name} rebuild starts now.`, read: false },
        { id: 2, type: 'info', text: `Salary cap: $${(TOTAL_SALARY_CAP / 1_000_000).toFixed(0)}M. Manage wisely!`, read: false },
        { id: 3, type: 'info', text: 'Set your rotations before simming games!', read: false },
      ],
      morale: 72,
      chemistry: 65,
    });
  }, []);

  const signFreeAgent = useCallback((player) => {
    setGameState(prev => {
      if (!prev) return prev;
      
      const newBudget = calculateAvailableCap([...prev.roster, player]);
      if (newBudget < 0) {
        const newNotif = { id: Date.now(), type: 'warning', text: `Not enough cap space! Need $${(Math.abs(newBudget) / 1_000_000).toFixed(1)}M more.`, read: false };
        return { ...prev, notifications: [newNotif, ...prev.notifications] };
      }

      const newRoster = [...prev.roster, { ...player, teamId: prev.team.id }];
      const newNotif = { id: Date.now(), type: 'success', text: `Signed ${player.firstName} ${player.lastName} for ${formatSalary(player.salary)}/yr`, read: false };
      
      const newPlayerStats = { ...prev.playerStats };
      if (!newPlayerStats[player.id]) {
        newPlayerStats[player.id] = {
          gamesPlayed: 0,
          totalPoints: 0,
          totalRebounds: 0,
          totalAssists: 0,
          totalSteals: 0,
          totalBlocks: 0,
          gameLog: [],
        };
      }

      return {
        ...prev,
        roster: newRoster,
        freeAgents: prev.freeAgents.filter(p => p.id !== player.id),
        budget: newBudget,
        playerStats: newPlayerStats,
        notifications: [newNotif, ...prev.notifications],
      };
    });
  }, []);

  const releasePlayer = useCallback((playerId) => {
    setGameState(prev => {
      if (!prev) return prev;
      const player = prev.roster.find(p => p.id === playerId);
      if (!player) return prev;
      const newRoster = prev.roster.filter(p => p.id !== playerId);
      const newNotif = { id: Date.now(), type: 'warning', text: `Released ${player.firstName} ${player.lastName}. Freed ${formatSalary(player.salary)}.`, read: false };
      return {
        ...prev,
        roster: newRoster,
        budget: calculateAvailableCap(newRoster),
        notifications: [newNotif, ...prev.notifications],
      };
    });
  }, []);

  const updateRotations = useCallback((starters, bench, minutesAlloc) => {
    setGameState(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        rotations: {
          starters,
          bench,
          minutesAlloc,
        },
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
      
      const unplayedGames = prev.schedule.filter(g => !g.played);
      if (!unplayedGames.length) {
        const newNotif = { id: Date.now(), type: 'info', text: 'Season complete!', read: false };
        setTimeout(() => setGameAnimation(null), 800);
        return { ...prev, notifications: [newNotif, ...prev.notifications] };
      }
      
      const nextGame = unplayedGames.sort((a, b) => parseDate(a.date) - parseDate(b.date))[0];
      
      setGameAnimation({ 
        game: nextGame, 
        progress: 1, 
        total: unplayedGames.length 
      });

      const yourTeam = prev.team;
      const opponent = NBA_TEAMS.find(t => t.abbr === nextGame.opponent);
      
      // Get active players from rotations
      const rotations = prev.rotations;
      const activePlayers = [...rotations.starters, ...rotations.bench].filter(p => p !== null);
      
      if (activePlayers.length < 5) {
        const newNotif = { id: Date.now(), type: 'warning', text: 'Need at least 5 players in rotation!', read: false };
        setTimeout(() => setGameAnimation(null), 800);
        return { ...prev, notifications: [newNotif, ...prev.notifications] };
      }

      // Calculate team strength from active roster
      const avgActiveOvr = activePlayers.reduce((sum, p) => sum + p.ovr, 0) / activePlayers.length;
      const homeBonus = nextGame.isHome ? 2 : -2;
      const adjustedRating = avgActiveOvr + homeBonus;
      const adjustedOppRating = opponent.rating - homeBonus;
      
      const totalRating = adjustedRating + adjustedOppRating;
      const winProbability = adjustedRating / totalRating;
      
      const won = random() < winProbability;
      
      // Realistic scoring - better teams score more
      const baseScore = 100 + ((avgActiveOvr - 70) * 0.8);
      const yourScore = Math.round(baseScore + (Math.random() - 0.5) * 20);
      const oppBaseScore = 100 + ((opponent.rating - 70) * 0.8);
      const oppScore = Math.round(oppBaseScore + (Math.random() - 0.5) * 20);
      
      // Ensure close games
      const finalYourScore = won ? Math.max(oppScore + 1, yourScore) : Math.min(oppScore - 1, yourScore);
      const finalOppScore = won ? oppScore : Math.max(finalYourScore + 1, oppScore);
      
      const score = { us: finalYourScore, them: finalOppScore };
      
      // Generate player stats
      const newPlayerStats = { ...prev.playerStats };
      
      activePlayers.forEach(player => {
        const isStarter = rotations.starters.includes(player);
        const minutes = rotations.minutesAlloc[player.id] || (isStarter ? 32 : 12);
        const minuteMultiplier = minutes / 48;
        
        const baseStats = generatePlayerGameStats(player, isStarter, won);
        const gameStats = {
          ...baseStats,
          points: Math.round(baseStats.points * minuteMultiplier),
          rebounds: Math.round(baseStats.rebounds * minuteMultiplier),
          assists: Math.round(baseStats.assists * minuteMultiplier),
          steals: Math.round(baseStats.steals * minuteMultiplier),
          blocks: Math.round(baseStats.blocks * minuteMultiplier),
          minutes,
        };
        
        if (!newPlayerStats[player.id]) {
          newPlayerStats[player.id] = {
            gamesPlayed: 0,
            totalPoints: 0,
            totalRebounds: 0,
            totalAssists: 0,
            totalSteals: 0,
            totalBlocks: 0,
            gameLog: [],
          };
        }
        
        newPlayerStats[player.id].gamesPlayed++;
        newPlayerStats[player.id].totalPoints += gameStats.points;
        newPlayerStats[player.id].totalRebounds += gameStats.rebounds;
        newPlayerStats[player.id].totalAssists += gameStats.assists;
        newPlayerStats[player.id].totalSteals += gameStats.steals;
        newPlayerStats[player.id].totalBlocks += gameStats.blocks;
        newPlayerStats[player.id].gameLog.push(gameStats);
      });
      
      // Opponent roster - use all players
      const oppRoster = prev.allRosters[opponent.id];
      oppRoster.forEach(player => {
        const isStarter = oppRoster.indexOf(player) < 5;
        const gameStats = generatePlayerGameStats(player, isStarter, !won);
        
        if (!newPlayerStats[player.id]) {
          newPlayerStats[player.id] = {
            gamesPlayed: 0,
            totalPoints: 0,
            totalRebounds: 0,
            totalAssists: 0,
            totalSteals: 0,
            totalBlocks: 0,
            gameLog: [],
          };
        }
        
        newPlayerStats[player.id].gamesPlayed++;
        newPlayerStats[player.id].totalPoints += gameStats.points;
        newPlayerStats[player.id].totalRebounds += gameStats.rebounds;
        newPlayerStats[player.id].totalAssists += gameStats.assists;
        newPlayerStats[player.id].totalSteals += gameStats.steals;
        newPlayerStats[player.id].totalBlocks += gameStats.blocks;
        newPlayerStats[player.id].gameLog.push(gameStats);
      });
      
      const result = `${won ? 'W' : 'L'} ${score.us}-${score.them} vs ${nextGame.opponent}`;
      const newNotif = { id: Date.now(), type: won ? 'success' : 'warning', text: result, read: false };
      
      // Update all schedules and records
      const newAllSchedules = { ...prev.allSchedules };
      const newTeamRecords = { ...prev.teamRecords };
      
      // Your game
      newAllSchedules[prev.team.id] = prev.schedule.map(g => g.id === nextGame.id ? { ...g, played: true, won, score } : g);
      newTeamRecords[prev.team.id].w += won ? 1 : 0;
      newTeamRecords[prev.team.id].l += !won ? 1 : 0;
      newTeamRecords[prev.team.id].pf += score.us;
      newTeamRecords[prev.team.id].pa += score.them;
      
      const gameDate = nextGame.date;
      
      // Simulate other games on same day
      NBA_TEAMS.forEach(team => {
        if (team.id !== prev.team.id) {
          const teamSchedule = newAllSchedules[team.id];
          const gamesOnSameDay = teamSchedule.filter(g => g.date === gameDate && !g.played);
          
          gamesOnSameDay.forEach(game => {
            const oppTeam = NBA_TEAMS.find(t => t.abbr === game.opponent);
            if (!oppTeam) return;
            
            const teamRating = team.rating;
            const oppTeamRating = oppTeam.rating;
            const teamHomeBonus = game.isHome ? 2 : -2;
            const adjustedTeamRating = teamRating + teamHomeBonus;
            const adjustedOppTeamRating = oppTeamRating - teamHomeBonus;
            
            const totalTeamRating = adjustedTeamRating + adjustedOppTeamRating;
            const teamWinProb = adjustedTeamRating / totalTeamRating;
            const teamWon = random() < teamWinProb;
            
            const teamBaseScore = 100 + ((teamRating - 70) * 0.8);
            const teamScore = Math.round(teamBaseScore + (Math.random() - 0.5) * 20);
            const oppBaseScore = 100 + ((oppTeamRating - 70) * 0.8);
            const oppScore = Math.round(oppBaseScore + (Math.random() - 0.5) * 20);
            
            const finalTeamScore = teamWon ? Math.max(oppScore + 1, teamScore) : Math.min(oppScore - 1, teamScore);
            const finalOppScore = teamWon ? oppScore : Math.max(finalTeamScore + 1, oppScore);
            
            const teamGameScore = { us: finalTeamScore, them: finalOppScore };
            
            newAllSchedules[team.id] = teamSchedule.map(g => 
              g.id === game.id ? { ...g, played: true, won: teamWon, score: teamGameScore } : g
            );
            
            newTeamRecords[team.id].w += teamWon ? 1 : 0;
            newTeamRecords[team.id].l += !teamWon ? 1 : 0;
            newTeamRecords[team.id].pf += teamGameScore.us;
            newTeamRecords[team.id].pa += teamGameScore.them;
          });
        }
      });
      
      const newSchedule = newAllSchedules[prev.team.id];
      
      playBuzzer();
      setTimeout(() => setGameAnimation(null), 800);
      
      return {
        ...prev,
        wins: won ? prev.wins + 1 : prev.wins,
        losses: !won ? prev.losses + 1 : prev.losses,
        week: prev.week + 1,
        schedule: newSchedule,
        allSchedules: newAllSchedules,
        teamRecords: newTeamRecords,
        playerStats: newPlayerStats,
        notifications: [newNotif, ...prev.notifications],
      };
    });
  }, []);

  const executeTrade = useCallback((trade) => {
    setGameState(prev => {
      if (!prev) return prev;
      
      const yourPlayers = trade.yourPlayers;
      const theirPlayers = trade.theirPlayers;
      const theirTeam = trade.from;
      
      // Calculate new cap
      let newRoster = prev.roster.filter(p => !yourPlayers.find(tp => tp.id === p.id));
      newRoster = [...newRoster, ...theirPlayers.map(p => ({ ...p, teamId: prev.team.id }))];
      
      const newBudget = calculateAvailableCap(newRoster);
      if (newBudget < 0) {
        const newNotif = { id: Date.now(), type: 'warning', text: 'Trade would exceed salary cap!', read: false };
        return { ...prev, notifications: [newNotif, ...prev.notifications] };
      }
      
      const newAllRosters = { ...prev.allRosters };
      newAllRosters[prev.team.id] = newRoster;
      newAllRosters[theirTeam.id] = prev.allRosters[theirTeam.id]
        .filter(p => !theirPlayers.find(tp => tp.id === p.id))
        .concat(yourPlayers.map(p => ({ ...p, teamId: theirTeam.id })));
      
      const tradeDescription = `Traded ${trade.yourPlayers.map(p => p.lastName).join(', ')} for ${trade.theirPlayers.map(p => p.lastName).join(', ')} with ${theirTeam.abbr}`;
      const newNotif = { id: Date.now(), type: 'success', text: tradeDescription, read: false };
      
      const newTradeHistory = [...prev.tradeHistory, {
        id: Date.now(),
        week: prev.week,
        yourPlayers: trade.yourPlayers,
        theirPlayers: trade.theirPlayers,
        with: theirTeam,
        timestamp: new Date().toLocaleString(),
      }];
      
      return {
        ...prev,
        roster: newRoster,
        budget: newBudget,
        allRosters: newAllRosters,
        tradeHistory: newTradeHistory,
        notifications: [newNotif, ...prev.notifications],
      };
    });
  }, []);

  const declineTrade = useCallback((trade) => {
    setGameState(prev => {
      if (!prev) return prev;
      const newNotif = { id: Date.now(), type: 'info', text: `Trade declined with ${trade.from.abbr}`, read: false };
      return { ...prev, notifications: [newNotif, ...prev.notifications] };
    });
  }, []);

  return (
    <GameContext.Provider value={{ gameState, gameAnimation, startGame, signFreeAgent, releasePlayer, markNotifRead, simulateGame, executeTrade, declineTrade, updateRotations }}>
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
