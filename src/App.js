import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import { GameProvider } from './hooks/useGameState';
import StartGame from './pages/StartGame';
import GameLayout from './components/GameLayout';
import Dashboard from './pages/Dashboard';
import Roster from './pages/Roster';
import Trades from './pages/Trades';
import FreeAgents from './pages/FreeAgents';
import Schedule from './pages/Schedule';
import Draft from './pages/Draft';
import Standings from './pages/Standings';

export default function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartGame />} />
          <Route element={<GameLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/roster" element={<Roster />} />
            <Route path="/trades" element={<Trades />} />
            <Route path="/free-agents" element={<FreeAgents />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/draft" element={<Draft />} />
            <Route path="/standings" element={<Standings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}
