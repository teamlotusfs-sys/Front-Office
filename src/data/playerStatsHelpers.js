// Calculate base PPG from OVR
export function getBasePPG(ovr, position) {
  // Linear scale: 59 OVR = 4 PPG, 99 OVR = 28 PPG
  const basePPG = ((ovr - 59) / 40) * 24 + 4;
  
  // Position adjusters
  const positionMultiplier = {
    'PG': 0.9,   // Point guards score less
    'SG': 1.0,   // Shooting guards baseline
    'SF': 1.05,  // Small forwards slightly more
    'PF': 1.15,  // Power forwards more
    'C': 1.1,    // Centers more
  };
  
  return basePPG * (positionMultiplier[position] || 1.0);
}

// Generate random variance for a game
export function getGameVariance() {
  const rand = Math.random();
  
  // 15% chance of hot game (+5 to +10 points)
  if (rand > 0.85) {
    return 5 + Math.random() * 5;
  }
  
  // 10% chance of cold game (-5 to -10 points)
  if (rand < 0.10) {
    return -5 - Math.random() * 5;
  }
  
  // Normal variance: -3 to +3
  return (Math.random() - 0.5) * 6;
}

// Calculate minutes played (starters vs bench)
export function getMinutesPlayed(isStarter) {
  if (isStarter) {
    return 30 + Math.floor(Math.random() * 8); // 30-38 minutes
  } else {
    return 8 + Math.floor(Math.random() * 14); // 8-22 minutes
  }
}

// Generate stats for a player in a game
export function generatePlayerGameStats(player, isStarter, teamWon) {
  const basePPG = getBasePPG(player.ovr, player.position);
  const variance = getGameVariance();
  const minutes = getMinutesPlayed(isStarter);
  
  // Win bonus: +2 to +3 points on average if team won
  const winBonus = teamWon ? 2 + Math.random() * 1.5 : 0;
  
  // Calculate points
  const pointsPerMinute = (basePPG + variance + winBonus) / 36; // normalized to 36 min
  const points = Math.max(0, Math.round(pointsPerMinute * minutes));
  
  // Calculate other stats (proportional to points and OVR)
  const rebounds = Math.max(0, Math.round(
    (player.position === 'C' ? 8 : player.position === 'PF' ? 6 : 3) * 
    (minutes / 36) * 
    (player.ovr / 80)
  ));
  
  const assists = Math.max(0, Math.round(
    (player.position === 'PG' ? 6 : player.position === 'SG' ? 3 : 2) * 
    (minutes / 36) * 
    (player.ovr / 80)
  ));
  
  const steals = Math.max(0, Math.round(
    (1 + Math.random() * 0.5) * 
    (minutes / 36) * 
    (player.ovr / 90)
  ));
  
  const blocks = Math.max(0, Math.round(
    (player.position === 'C' ? 1.5 : player.position === 'PF' ? 0.5 : 0.1) * 
    (minutes / 36) * 
    (player.ovr / 80)
  ));
  
  return {
    points,
    rebounds,
    assists,
    steals,
    blocks,
    minutes: Math.round(minutes * 10) / 10,
    fgm: Math.round(points * 0.45),
    fga: Math.round(points * 0.45 / 0.45),
  };
}
