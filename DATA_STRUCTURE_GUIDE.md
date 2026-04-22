# 🗂️ New Data Structure Reference

## Game State Object

```javascript
gameState = {
  // Team Info
  team: { id: 'LAL', name: 'LA Lakers', ... },
  gmName: "Player Name",
  season: 2025,

  // NEW: Current date tracking
  currentDate: "Oct 15",  // Current position in season

  // NEW: Master Schedule (Single source of truth)
  leagueSchedule: [
    {
      id: "game_1",
      date: "Oct 15",
      homeTeam: "LAL",      // Team ID, not abbr
      awayTeam: "GSW",      // Team ID, not abbr  
      played: false,
      homeScore: null,      // Set after simulation
      awayScore: null,      // Set after simulation
      winner: null,         // Team ID of winner
      boxScore: {           // Set after simulation
        home: [...],        // Array of player stats
        away: [...],        // Array of player stats
        homeTeam: "LAL",    // Abbr for display
        awayTeam: "GSW",    // Abbr for display
      }
    },
    // ... ~1,230 games total
  ],

  // NEW: Team Schedule Views (Derived from leagueSchedule)
  teamSchedules: {
    LAL: [
      {
        id: "game_1",          // References master schedule
        date: "Oct 15",
        opponent: "GSW",       // Team ID of opponent
        isHome: true,
        played: false,
        won: null,             // true/false after played
        score: {               // Set after played
          us: 110,
          them: 105
        },
        boxScore: { ... }      // Same as master
      },
      // ... 82 games for LAL
    ],
    GSW: [ ... ],  // 82 games for GSW
    // ... all 30 teams
  },

  // User's team schedule (same as teamSchedules[team.id])
  schedule: [ ... ],  // 82 games

  // Rosters
  allRosters: {
    LAL: [ ...players... ],
    GSW: [ ...players... ],
    // ... all 30 teams
  },
  roster: [ ...players... ],  // User's roster (same as allRosters[team.id])

  // Player Stats
  playerStats: {
    [playerId]: {
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
      gameLog: [
        {
          date: "Oct 15",
          opponent: "GSW",
          minutes: 32,
          points: 24,
          // ... full stat line
        }
      ]
    }
  },

  // Other existing properties (unchanged)
  budget: 45000000,
  rotations: { starters: [...], bench: [...], minutesAlloc: {} },
  draftPicks: [ ... ],
  freeAgents: [ ... ],
  tradeHistory: [ ... ],
  notifications: [ ... ],
  morale: 72,
  chemistry: 65,

  // REMOVED (no longer needed):
  // - allSchedules (replaced by teamSchedules)
  // - teamRecords (calculated on-the-fly from teamSchedules)
  // - wins (calculated from schedule)
  // - losses (calculated from schedule)
  // - week (replaced by currentDate)
}
```

---

## Migration Guide: Old → New

### Accessing Team Records

**OLD WAY:**
```javascript
const wins = gameState.wins;
const losses = gameState.losses;
```

**NEW WAY:**
```javascript
const wins = gameState.schedule.filter(g => g.played && g.won).length;
const losses = gameState.schedule.filter(g => g.played && !g.won).length;
```

### Accessing Other Team Schedules

**OLD WAY:**
```javascript
const lakersSchedule = gameState.allSchedules['LAL'];
```

**NEW WAY:**
```javascript
const lakersSchedule = gameState.teamSchedules['LAL'];
```

### Finding Current Game

**OLD WAY:**
```javascript
const nextGame = gameState.schedule.find(g => !g.played);
// Game had: opponent (abbr), oppName, oppColor
```

**NEW WAY:**
```javascript
const nextGame = gameState.schedule.find(g => !g.played);
// Game has: opponent (team ID)
// To get name: NBA_TEAMS.find(t => t.id === nextGame.opponent)
```

### Calculating League Standings

**OLD WAY:**
```javascript
// Had to loop through allSchedules
NBA_TEAMS.forEach(team => {
  const schedule = gameState.allSchedules[team.id];
  const wins = schedule.filter(g => g.played && g.won).length;
  // ...
});
```

**NEW WAY:**
```javascript
// Loop through teamSchedules (same pattern)
NBA_TEAMS.forEach(team => {
  const schedule = gameState.teamSchedules[team.id];
  const wins = schedule.filter(g => g.played && g.won).length;
  // ...
});
```

---

## Key Differences

### Schedule Game Object Changes

| Property | Old Value | New Value |
|----------|-----------|-----------|
| opponent | "GSW" (abbr) | "GSW" (team ID) |
| oppName | "Golden State Warriors" | NOT INCLUDED |
| oppColor | "#1D428A" | NOT INCLUDED |

**Why?** Opponent info should be looked up from `NBA_TEAMS` array to avoid data duplication.

**How to get opponent info:**
```javascript
const game = gameState.schedule[0];
const opponent = NBA_TEAMS.find(t => t.id === game.opponent);
console.log(opponent.name);   // "Golden State Warriors"
console.log(opponent.color);  // "#1D428A"
console.log(opponent.abbr);   // "GSW"
```

---

## Simulation Flow

### When `simulateGame()` is called:

```
1. Find user's next unplayed game
   ↓
2. Get that game's date (e.g., "Oct 15")
   ↓
3. Find ALL games in leagueSchedule with date = "Oct 15" AND played = false
   ↓
4. For each game on Oct 15:
   - Calculate win probability (with momentum, fatigue, home court)
   - Determine winner
   - Generate realistic scores
   - Create box scores for both teams
   - Update player stats
   ↓
5. Update leagueSchedule with results
   ↓
6. Rebuild ALL teamSchedules from updated leagueSchedule
   ↓
7. Update currentDate to next unplayed date
   ↓
8. Return updated gameState
```

### Important: One Simulation = One Day

Unlike before where you simmed "your next game", now you sim "the next day of games".

**Typical day:** 10-15 games across the league
**Your involvement:** Just 1 of those games

This keeps all teams progressing together realistically!

---

## Debugging Tips

### Check if standings are accurate:

```javascript
// In browser console after simming games:
const { gameState } = useGame();

NBA_TEAMS.forEach(team => {
  const schedule = gameState.teamSchedules[team.id];
  const played = schedule.filter(g => g.played).length;
  const wins = schedule.filter(g => g.played && g.won).length;
  const losses = schedule.filter(g => g.played && !g.won).length;

  console.log(`${team.abbr}: ${wins}-${losses} (${played} GP)`);

  // Should be: wins + losses = played
  if (wins + losses !== played) {
    console.error(`❌ MISMATCH for ${team.abbr}`);
  }
});
```

### Verify master schedule integrity:

```javascript
const { leagueSchedule } = gameState;

// Check for duplicate games
const gameIds = new Set();
leagueSchedule.forEach(g => {
  if (gameIds.has(g.id)) {
    console.error(`❌ Duplicate game ID: ${g.id}`);
  }
  gameIds.add(g.id);
});

// Check that played games have scores
leagueSchedule.forEach(g => {
  if (g.played && (!g.homeScore || !g.awayScore || !g.winner)) {
    console.error(`❌ Game ${g.id} marked played but missing data`);
  }
});

console.log(`✅ Verified ${leagueSchedule.length} games`);
```

---

## Performance Notes

### Why this is faster:

**OLD SYSTEM:**
- Simulated games independently per team
- Duplicate simulations (both teams simulating same game)
- Had to reconcile schedules to avoid conflicts
- Looped through all 30 teams every simulation

**NEW SYSTEM:**
- Each game simulated exactly once
- Only processes games on current date (10-15 games)
- Team schedules are lightweight views (no duplication)
- Single source of truth (leagueSchedule)

**Result:** ~2-3x faster simulation, especially when simming full season!

---

## Edge Cases Handled

✅ **No double-headers:** Each team plays max 1 game per day
✅ **Balanced schedule:** Each team gets exactly 82 games
✅ **No orphaned games:** Every game appears in exactly 2 team schedules
✅ **Date sorting:** Games always processed in chronological order
✅ **Season completion:** When all games played, simulation gracefully stops

---

## Common Questions

**Q: Can I still access `gameState.wins` and `gameState.losses`?**
A: No, these were removed. Calculate from schedule:
```javascript
const wins = schedule.filter(g => g.played && g.won).length;
```

**Q: What if opponent info is missing from a game?**
A: Look it up from NBA_TEAMS:
```javascript
const opponent = NBA_TEAMS.find(t => t.id === game.opponent);
```

**Q: How do I know which teams are playing today?**
A: Filter leagueSchedule by currentDate:
```javascript
const todaysGames = leagueSchedule.filter(g => 
  g.date === gameState.currentDate && !g.played
);
```

**Q: Can I simulate a specific date, not just "next game"?**
A: Not yet, but easy to add! The infrastructure supports it.

---

That's everything! The new system is much cleaner and mathematically sound. 🎉
