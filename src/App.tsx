/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import MusicPlayer from './components/MusicPlayer';
import SnakeGame from './components/SnakeGame';

export default function App() {
  const [themeColor, setThemeColor] = useState('cyan');

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-black text-cyan-400 font-terminal relative overflow-hidden">
      <div className="static-noise"></div>
      <div className="scanlines"></div>
      
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10">
        
        {/* Left/Top: Title & Info */}
        <div className="lg:col-span-3 flex flex-col items-start text-left space-y-6 border-l-4 border-fuchsia-500 pl-4 py-2">
          <h1 className="font-pixel text-2xl md:text-3xl text-white glitch-text uppercase" data-text="SYS.OP.SNAKE">
            SYS.OP.SNAKE
          </h1>
          <div className="space-y-2 text-xl">
            <p className="text-fuchsia-400 animate-pulse">&gt; STATUS: ONLINE</p>
            <p className="text-cyan-400">&gt; WARNING: NEURAL OVERLOAD IMMINENT.</p>
            <p className="text-cyan-400">&gt; AUDIO SYNC REQUIRED FOR SURVIVAL.</p>
            <p className="text-gray-500 mt-4">_AWAITING_USER_INPUT...</p>
          </div>
        </div>

        {/* Center: Game */}
        <div className="lg:col-span-6 flex justify-center">
          <SnakeGame themeColor={themeColor} />
        </div>

        {/* Right/Bottom: Music Player */}
        <div className="lg:col-span-3 flex justify-end">
          <MusicPlayer onTrackChange={setThemeColor} />
        </div>

      </div>
    </div>
  );
}
