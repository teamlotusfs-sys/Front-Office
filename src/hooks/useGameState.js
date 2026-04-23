import React, { createContext, useContext, useState, useCallback } from 'react';
import { NBA_TEAMS, generateRoster, generateLeagueSchedule, generateDraftPicks, generateFreeAgents } from '../data/nbaData';
import { generateTeamBoxScore } from '../data/playerStatsHelpers';

const GameContext = createContext(null);
const TOTAL_SALARY_CAP = 150_000_000;

function random() {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const arr = new Uint32Array(1);
    crypto.getRandomValues(arr);
    return arr[0] / 4294967296;
  }
  return Math.random();
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
  } catch (e) {}
}

export function GameProvider({ children }) {
  const [gameState, setGameState] = useState(null);
  const [gameAnimation, setGameAnimation] = useState(null);

  const startGame = useCallback((teamId, gmName) => {
    const team = NBA_TEAMS.find(t => t.id === teamId);
    const allRosters = {};

    // Generate rosters for all teams
    NBA_TEAMS.forEach(t => { 
      allRosters[t.id] = generateRoster(t.id);
    });

    // Initialize player stats for all players
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
          totalFGM: 0,
          totalFGA: 0,
          totalTPM: 0,
          totalTPA: 0,
          totalFTM: 0,
          totalFTA: 0,
          totalTurnovers: 0,
          gameLog: [],
        };
      });
    });

    // Generate MASTER league schedule (single source of truth)
    const leagueSchedule = generateLeagueSchedule();

    // Get current date (first game date)
    const currentDate = leagueSchedule.length > 0 ? leagueSchedule[0].date : 'Oct 15';

    // Build team-specific schedule views (references to master schedule)
    const teamSchedules = {};
    NBA_TEAMS.forEach(t => {
      teamSchedules[t.id] = leagueSchedule
        .filter(g => g.homeTeam === t.id || g.awayTeam === t.id)
        .map(g => ({
          id: g.id,
          date: g.date,
          opponent: g.homeTeam === t.id ? g.awayTeam : g.homeTeam,
          isHome: g.homeTeam === t.id,
          played: g.played,
          won: g.played ? (g.winner === t.id) : null,
          score: g.played ? {
            us: g.homeTeam === t.id ? g.homeScore : g.awayScore,
            them: g.homeTeam === t.id ? g.awayScore : g.homeScore,
          } : null,
          boxScore: g.boxScore,
        }));
    });

    const initialRoster = allRosters[teamId];

    setGameState({
      team,
      gmName,
      season: 2025,
      currentDate,
      budget: calculateAvailableCap(initialRoster),
      roster: initialRoster,
      schedule: teamSchedules[teamId],
      leagueSchedule, // Master schedule
      teamSchedules, // All team views
      allRosters,
      playerStats,
      draftPicks: generateDraftPicks(teamId),
      freeAgents: generateFreeAgents(50),
      tradeHistory: [],
      rotations: {
        starters: Array(5).fill(null),
        bench: Array(8).fill(null),
        minutesAlloc: {},
      },
      notifications: [
        { id: 1, type: 'info', text: `Welcome, GM ${gmName}! The ${team.name} rebuild starts now.`, read: false },
        { id: 2, type: 'info', text: 'Set your rotations before simming games!', read: false },
      ],
      morale: 72,
      chemistry: 65,
      // Team momentum tracking (for win probability)
      teamMomentum: {},
    });
  }, []);

  const signFreeAgent = useCallback((player) => {
    setGameState(prev => {
      if (!prev) return prev;
      
      const newBudget = calculateAvailableCap([...prev.roster, player]);
      if (newBudget < 0) {
        const newNotif = { id: Date.now(), type: 'warning', text: `Not enough cap space!`, read: false };
        return { ...prev, notifications: [newNotif, ...prev.notifications] };
      }

      const newRoster = [...prev.roster, { ...player, teamId: prev.team.id }];
      const newNotif = { id: Date.now(), type: 'success', text: `Signed ${player.firstName} ${player.lastName}`, read: false };
      
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
      const newNotif = { id: Date.now(), type: 'warning', text: `Released ${player.firstName} ${player.lastName}`, read: false };
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
        rotations: { starters, bench, minutesAlloc },
      };
    });
  }, []);

  const autoSetRotations = useCallback(() => {
    setGameState(prev => {
      if (!prev || !prev.roster) return prev;

      const positions = ['PG', 'SG', 'SF', 'PF', 'C'];
      const sortedRoster = [...prev.roster].sort((a, b) => b.ovr - a.ovr);
      const starters = Array(5).fill(null);
      const bench = Array(8).fill(null);
      const minutesAlloc = {};
      const usedPlayers = new Set();

      // Helper function to check if player can play position
      const canPlayPosition = (player, position) => {
        return player.pos === position || player.secondaryPos === position;
      };

      // First pass: Fill positions with primary position players (best OVR)
      positions.forEach((pos, idx) => {
        const player = sortedRoster.find(p => 
          p.pos === pos && !usedPlayers.has(p.id)
        );
        if (player) {
          starters[idx] = player;
          usedPlayers.add(player.id);
          minutesAlloc[player.id] = 32;
        }
      });

      // Second pass: Fill remaining spots with secondary position players
      positions.forEach((pos, idx) => {
        if (!starters[idx]) {
          const player = sortedRoster.find(p => 
            canPlayPosition(p, pos) && !usedPlayers.has(p.id)
          );
          if (player) {
            starters[idx] = player;
            usedPlayers.add(player.id);
            minutesAlloc[player.id] = 32;
          }
        }
      });

      // Third pass: If still empty, just use best available players
      positions.forEach((pos, idx) => {
        if (!starters[idx]) {
          const player = sortedRoster.find(p => !usedPlayers.has(p.id));
          if (player) {
            starters[idx] = player;
            usedPlayers.add(player.id);
            minutesAlloc[player.id] = 32;
          }
        }
      });

      // Fill bench with next 8 best players
      let benchIdx = 0;
      for (const player of sortedRoster) {
        if (benchIdx >= 8) break;
        if (!usedPlayers.has(player.id)) {
          bench[benchIdx] = player;
          minutesAlloc[player.id] = 16;
          usedPlayers.add(player.id);
          benchIdx++;
        }
      }

      const newNotif = { 
        id: Date.now(), 
        type: 'success', 
        text: 'Rotations automatically set based on player OVR and positions', 
        read: false 
      };

      return {
        ...prev,
        rotations: { starters, bench, minutesAlloc },
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

    // Find next unplayed game for user's team
    const myNextGame = prev.schedule.find(g => !g.played);
    if (!myNextGame) {
      const newNotif = { id: Date.now(), type: 'info', text: 'Season complete!', read: false };
      return { ...prev, notifications: [newNotif, ...prev.notifications] };
    }

    setGameAnimation({ game: myNextGame, progress: 1, total: prev.schedule.filter(g => !g.played).length });

    // Validate rotations
    const rotations = prev.rotations;
    const activePlayers = [...rotations.starters, ...rotations.bench].filter(p => p !== null);

    if (activePlayers.length < 5) {
      const newNotif = { id: Date.now(), type: 'warning', text: 'Need 5+ players in rotation!', read: false };
      setGameAnimation(null);
      return { ...prev, notifications: [newNotif, ...prev.notifications] };
    }

    // Helper functions
    const calculateTeamRating = (roster) => {
      if (!roster || roster.length === 0) return 70;
      const topPlayers = [...roster].sort((a, b) => b.ovr - a.ovr).slice(0, 8);
      return topPlayers.reduce((sum, p) => sum + p.ovr, 0) / topPlayers.length;
    };

    const getTeamMomentum = (teamId, teamSchedule) => {
      // Look at last 5 games for hot/cold streak
      const recentGames = teamSchedule.filter(g => g.played).slice(-5);
      if (recentGames.length === 0) return 0;

      const recentWins = recentGames.filter(g => g.won).length;
      // Momentum ranges from -3 (0-5 record) to +3 (5-0 record)
      return ((recentWins / recentGames.length) - 0.5) * 6;
    };

    const isBackToBack = (teamId, date, leagueSchedule) => {
      // Check if team played yesterday
      const dateParts = date.split(' ');
      const month = dateParts[0];
      const day = parseInt(dateParts[1]);

      // Simple check: look for game day before (this is simplified)
      const yesterday = day > 1 ? `${month} ${day - 1}` : null;
      if (!yesterday) return false;

      return leagueSchedule.some(g => 
        g.date === yesterday && 
        g.played && 
        (g.homeTeam === teamId || g.awayTeam === teamId)
      );
    };

    const calculateWinProbability = (homeRating, awayRating, homeTeamId, awayTeamId, homeSchedule, awaySchedule, leagueSchedule, gameDate) => {
      // Base rating difference
      let homeAdvantage = (homeRating - awayRating) / 15;

      // Home court advantage (~60% for evenly matched teams)
      homeAdvantage += 0.25;

      // Momentum (hot/cold streaks)
      const homeMomentum = getTeamMomentum(homeTeamId, homeSchedule);
      const awayMomentum = getTeamMomentum(awayTeamId, awaySchedule);
      homeAdvantage += (homeMomentum - awayMomentum) * 0.03;

      // Fatigue (back-to-back games)
      const homeB2B = isBackToBack(homeTeamId, gameDate, leagueSchedule);
      const awayB2B = isBackToBack(awayTeamId, gameDate, leagueSchedule);
      if (homeB2B) homeAdvantage -= 0.15;
      if (awayB2B) homeAdvantage += 0.15;

      // Logistic function for win probability
      return 1 / (1 + Math.pow(Math.E, -homeAdvantage * 2));
    };

    const generateRealisticScore = (teamRating, oppRating, won) => {
      // Base pace and efficiency
      const pace = 98 + (random() - 0.5) * 8; // 94-102 possessions
      const offensiveEfficiency = 95 + (teamRating - 75) * 0.6; // Points per 100 poss.
      const defensiveImpact = (oppRating - 75) * 0.3;

      // Calculate expected points
      const expectedPoints = (pace * (offensiveEfficiency - defensiveImpact)) / 100;

      // Add variance using normal distribution (standard deviation ~6 points)
      const variance = (random() + random() + random() + random() - 2) * 3; // Approximates normal dist.
      let finalScore = Math.round(expectedPoints + variance);

      // Ensure score is reasonable (85-135 range)
      finalScore = Math.max(85, Math.min(135, finalScore));

      return finalScore;
    };

    // Clone the league schedule for updates
    const newLeagueSchedule = [...prev.leagueSchedule];
    const newPlayerStats = { ...prev.playerStats };

    // NBA 2K STYLE DATE-BASED SIMULATION:
    // When user clicks "Sim Next Game", simulate ALL league games up to that date
    // This allows teams to have different game counts (realistic NBA scheduling)

    // Helper to parse date strings for comparison
    const parseScheduleDate = (dateStr) => {
      const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
      const [month, day] = dateStr.split(' ');
      const monthIndex = months.indexOf(month);
      return monthIndex * 100 + parseInt(day);
    };

    // Get the date of user's next game
    const targetDate = myNextGame.date;
    const targetDateValue = parseScheduleDate(targetDate);

    // Find ALL unplayed games on or before this date across entire league
    const gamesToSimulate = newLeagueSchedule.filter(g => 
      !g.played && 
      parseScheduleDate(g.date) <= targetDateValue
    );

    // Simulate ALL these games
    gamesToSimulate.forEach(game => {
      const homeTeam = NBA_TEAMS.find(t => t.id === game.homeTeam);
      const awayTeam = NBA_TEAMS.find(t => t.id === game.awayTeam);

      const homeRoster = prev.allRosters[game.homeTeam] || [];
      const awayRoster = prev.allRosters[game.awayTeam] || [];

      // For user's team, use active rotation; for AI teams, use top 8 players
      let homeActivePlayers, awayActivePlayers;

      if (game.homeTeam === prev.team.id) {
        homeActivePlayers = activePlayers.map(p => ({
          ...p,
          requestedMinutes: rotations.minutesAlloc[p.id] || (rotations.starters.includes(p) ? 32 : 12)
        }));
      } else {
        homeActivePlayers = [...homeRoster].sort((a, b) => b.ovr - a.ovr).slice(0, 13);
      }

      if (game.awayTeam === prev.team.id) {
        awayActivePlayers = activePlayers.map(p => ({
          ...p,
          requestedMinutes: rotations.minutesAlloc[p.id] || (rotations.starters.includes(p) ? 32 : 12)
        }));
      } else {
        awayActivePlayers = [...awayRoster].sort((a, b) => b.ovr - a.ovr).slice(0, 13);
      }

      const homeRating = calculateTeamRating(homeActivePlayers);
      const awayRating = calculateTeamRating(awayActivePlayers);

      // Get team schedules for momentum calculation
      const homeSchedule = prev.teamSchedules[game.homeTeam] || [];
      const awaySchedule = prev.teamSchedules[game.awayTeam] || [];

      // Calculate win probability
      const homeWinProb = calculateWinProbability(
        homeRating, awayRating, 
        game.homeTeam, game.awayTeam,
        homeSchedule, awaySchedule,
        prev.leagueSchedule,
        game.date
      );

      const homeWon = random() < homeWinProb;

      // Generate realistic scores
      let homeScore = generateRealisticScore(homeRating, awayRating, homeWon);
      let awayScore = generateRealisticScore(awayRating, homeRating, !homeWon);

      // Ensure winner has higher score
      if (homeWon && homeScore <= awayScore) {
        homeScore = awayScore + Math.floor(random() * 8) + 1;
      } else if (!homeWon && awayScore <= homeScore) {
        awayScore = homeScore + Math.floor(random() * 8) + 1;
      }

      // Generate box scores
      const homeBoxScore = generateTeamBoxScore(homeActivePlayers, homeScore, homeWon);
      const awayBoxScore = generateTeamBoxScore(awayActivePlayers, awayScore, !homeWon);

      // Update player stats
      [...homeBoxScore, ...awayBoxScore].forEach(stat => {
        if (!newPlayerStats[stat.playerId]) {
          newPlayerStats[stat.playerId] = {
            gamesPlayed: 0,
            totalPoints: 0,
            totalRebounds: 0,
            totalAssists: 0,
            totalSteals: 0,
            totalBlocks: 0,
            totalFGM: 0,
            totalFGA: 0,
            totalTPM: 0,
            totalTPA: 0,
            totalFTM: 0,
            totalFTA: 0,
            totalTurnovers: 0,
            gameLog: [],
          };
        }

        if (stat.minutes > 0) {
          newPlayerStats[stat.playerId].gamesPlayed++;
          newPlayerStats[stat.playerId].totalPoints += stat.points;
          newPlayerStats[stat.playerId].totalRebounds += stat.rebounds;
          newPlayerStats[stat.playerId].totalAssists += stat.assists;
          newPlayerStats[stat.playerId].totalSteals += stat.steals;
          newPlayerStats[stat.playerId].totalBlocks += stat.blocks;
          newPlayerStats[stat.playerId].totalFGM += stat.fgm;
          newPlayerStats[stat.playerId].totalFGA += stat.fga;
          newPlayerStats[stat.playerId].totalTPM += stat.tpm;
          newPlayerStats[stat.playerId].totalTPA += stat.tpa;
          newPlayerStats[stat.playerId].totalFTM += stat.ftm;
          newPlayerStats[stat.playerId].totalFTA += stat.fta;
          newPlayerStats[stat.playerId].totalTurnovers += stat.turnovers;

          // Determine opponent based on whether player is in home or away box score
          const isHomePlayer = homeBoxScore.some(p => p.playerId === stat.playerId);
          const opponentAbbr = isHomePlayer ? awayTeam.abbr : homeTeam.abbr;

          newPlayerStats[stat.playerId].gameLog.push({
            date: game.date,
            opponent: opponentAbbr,
            ...stat
          });
        }
      });

      // Update the game in league schedule
      const gameIndex = newLeagueSchedule.findIndex(g => g.id === game.id);
      if (gameIndex !== -1) {
        newLeagueSchedule[gameIndex] = {
          ...game,
          played: true,
          homeScore,
          awayScore,
          winner: homeWon ? game.homeTeam : game.awayTeam,
          boxScore: {
            home: homeBoxScore,
            away: awayBoxScore,
            homeTeam: homeTeam.abbr,
            awayTeam: awayTeam.abbr,
          }
        };
      }
    });

    // Rebuild team schedule views from updated league schedule
    const newTeamSchedules = {};
    NBA_TEAMS.forEach(t => {
      newTeamSchedules[t.id] = newLeagueSchedule
        .filter(g => g.homeTeam === t.id || g.awayTeam === t.id)
        .map(g => ({
          id: g.id,
          date: g.date,
          opponent: g.homeTeam === t.id ? g.awayTeam : g.homeTeam,
          oppName: NBA_TEAMS.find(team => team.id === (g.homeTeam === t.id ? g.awayTeam : g.homeTeam))?.name,
          oppColor: NBA_TEAMS.find(team => team.id === (g.homeTeam === t.id ? g.awayTeam : g.homeTeam))?.color,
          isHome: g.homeTeam === t.id,
          played: g.played,
          won: g.played ? (g.winner === t.id) : null,
          score: g.played ? {
            us: g.homeTeam === t.id ? g.homeScore : g.awayScore,
            them: g.homeTeam === t.id ? g.awayScore : g.homeScore,
          } : null,
          boxScore: g.boxScore,
        }));
    });

    // Get user's game result
    const myGameResult = newTeamSchedules[prev.team.id].find(g => g.id === myNextGame.id);
    const won = myGameResult.won;
    const score = myGameResult.score;

    const result = `${won ? 'W' : 'L'} ${score.us}-${score.them} vs ${NBA_TEAMS.find(t => t.id === myNextGame.opponent)?.abbr}`;
    const newNotif = { id: Date.now(), type: won ? 'success' : 'warning', text: result, read: false };

    // Find next game date
    const remainingGames = newLeagueSchedule.filter(g => !g.played);
    const nextDate = remainingGames.length > 0 ? remainingGames[0].date : targetDate;

    playBuzzer();
    setTimeout(() => setGameAnimation(null), 800);

    return {
      ...prev,
      currentDate: nextDate,
      schedule: newTeamSchedules[prev.team.id],
      leagueSchedule: newLeagueSchedule,
      teamSchedules: newTeamSchedules,
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

      let newRoster = prev.roster.filter(p => !yourPlayers.find(tp => tp.id === p.id));
      newRoster = [...newRoster, ...theirPlayers.map(p => ({ ...p, teamId: prev.team.id }))];

      const newBudget = calculateAvailableCap(newRoster);
      if (newBudget < 0) {
        return { ...prev, notifications: [{ id: Date.now(), type: 'warning', text: 'Trade exceeds cap!', read: false }, ...prev.notifications] };
      }

      const newAllRosters = { ...prev.allRosters };
      newAllRosters[prev.team.id] = newRoster;
      newAllRosters[theirTeam.id] = prev.allRosters[theirTeam.id]
        .filter(p => !theirPlayers.find(tp => tp.id === p.id))
        .concat(yourPlayers.map(p => ({ ...p, teamId: theirTeam.id })));

      const tradeDescription = `Traded ${trade.yourPlayers.map(p => p.lastName).join(', ')} for ${trade.theirPlayers.map(p => p.lastName).join(', ')} with ${theirTeam.abbr}`;
      const newNotif = { id: Date.now(), type: 'success', text: tradeDescription, read: false };

      return {
        ...prev,
        roster: newRoster,
        budget: newBudget,
        allRosters: newAllRosters,
        notifications: [newNotif, ...prev.notifications],
      };
    });
  }, []);

  const declineTrade = useCallback((trade) => {
    setGameState(prev => {
      if (!prev) return prev;
      return { ...prev, notifications: [{ id: Date.now(), type: 'info', text: `Trade declined with ${trade.from.abbr}`, read: false }, ...prev.notifications] };
    });
  }, []);

  return (
    <GameContext.Provider value={{ gameState, gameAnimation, startGame, signFreeAgent, releasePlayer, markNotifRead, simulateGame, executeTrade, declineTrade, updateRotations, autoSetRotations }}>
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
