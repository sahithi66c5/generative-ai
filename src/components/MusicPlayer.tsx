import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Terminal } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "DATA_STREAM_01.WAV", artist: "UNKNOWN_ENTITY", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", color: "cyan" },
  { id: 2, title: "CORRUPT_SECTOR.MP3", artist: "SYS_ADMIN", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", color: "fuchsia" },
  { id: 3, title: "VOID_RESONANCE.FLAC", artist: "NULL_PTR", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", color: "cyan" }
];

interface MusicPlayerProps {
  onTrackChange?: (color: string) => void;
}

export default function MusicPlayer({ onTrackChange }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const track = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (onTrackChange) onTrackChange(track.color);
  }, [currentTrackIndex, track.color, onTrackChange]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(e => console.error("ERR_AUDIO_PLAY:", e));
    } else if (!isPlaying && audioRef.current) {
      audioRef.current.pause();
    }
  }, [isPlaying, currentTrackIndex]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  const nextTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  }, []);

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      if (duration) setProgress((current / duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    setProgress(value);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = (value / 100) * audioRef.current.duration;
    }
  };

  const isFuchsia = track.color === 'fuchsia';
  const primaryColor = isFuchsia ? 'text-fuchsia-500' : 'text-cyan-500';
  const borderColor = isFuchsia ? 'border-fuchsia-500' : 'border-cyan-500';
  const bgColor = isFuchsia ? 'bg-fuchsia-500' : 'bg-cyan-500';

  return (
    <div className={`w-full max-w-md p-4 bg-black border-2 ${borderColor} font-terminal uppercase tracking-widest relative`}>
      <div className={`absolute top-0 left-0 w-full h-1 ${bgColor} animate-pulse`}></div>
      <audio ref={audioRef} src={track.url} onTimeUpdate={handleTimeUpdate} onEnded={nextTrack} />
      
      <div className="flex items-start justify-between mb-6 mt-2 border-b border-gray-800 pb-4">
        <div className="flex items-center gap-3">
          <Terminal className={`w-8 h-8 ${primaryColor}`} />
          <div>
            <h3 className={`font-pixel text-xs ${primaryColor} mb-1`}>{track.title}</h3>
            <p className="text-gray-500 text-lg">SRC: {track.artist}</p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-gray-500 mb-1 font-pixel">
          <span>{Math.floor(progress)}%</span>
          <span className={isPlaying ? 'animate-pulse text-fuchsia-500' : ''}>
            {isPlaying ? 'STREAMING...' : 'IDLE'}
          </span>
        </div>
        <input 
          type="range" min="0" max="100" value={progress || 0} onChange={handleSeek}
          className={`w-full h-4 appearance-none cursor-pointer bg-gray-900 border ${borderColor}`}
          style={{ background: `linear-gradient(to right, ${isFuchsia ? '#FF00FF' : '#00FFFF'} ${progress}%, #111 ${progress}%)` }}
        />
      </div>

      <div className="flex items-center justify-between border-t border-gray-800 pt-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setIsMuted(!isMuted)} className={`p-1 ${primaryColor} hover:bg-gray-900`}>
            {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
          </button>
          <input 
            type="range" min="0" max="1" step="0.01" value={isMuted ? 0 : volume} 
            onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
            className={`w-16 h-2 bg-gray-900 border ${borderColor} appearance-none cursor-pointer`}
          />
        </div>

        <div className="flex items-center gap-2">
          <button onClick={prevTrack} className={`p-2 border ${borderColor} ${primaryColor} hover:bg-gray-900`}>
            <SkipBack className="w-5 h-5" />
          </button>
          <button onClick={togglePlay} className={`p-2 border-2 ${borderColor} ${bgColor} text-black hover:bg-transparent hover:${primaryColor}`}>
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button onClick={nextTrack} className={`p-2 border ${borderColor} ${primaryColor} hover:bg-gray-900`}>
            <SkipForward className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
