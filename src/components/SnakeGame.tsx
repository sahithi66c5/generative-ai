import React, { useState, useEffect, useCallback, useRef } from 'react';

type Point = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const INITIAL_SNAKE: Point[] = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION: Direction = 'UP';
const BASE_SPEED = 120;

interface SnakeGameProps { themeColor?: string; }

export default function SnakeGame({ themeColor = 'cyan' }: SnakeGameProps) {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  
  const directionRef = useRef<Direction>(INITIAL_DIRECTION);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    let isOccupied = true;
    while (isOccupied) {
      newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
      // eslint-disable-next-line no-loop-func
      isOccupied = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    }
    return newFood!;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setFood(generateFood(INITIAL_SNAKE));
    setHasStarted(true);
    setIsPaused(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
      if (e.key === ' ' && hasStarted && !gameOver) { setIsPaused(prev => !prev); return; }
      if (!hasStarted || isPaused || gameOver) return;
      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W': if (directionRef.current !== 'DOWN') setDirection('UP'); break;
        case 'ArrowDown': case 's': case 'S': if (directionRef.current !== 'UP') setDirection('DOWN'); break;
        case 'ArrowLeft': case 'a': case 'A': if (directionRef.current !== 'RIGHT') setDirection('LEFT'); break;
        case 'ArrowRight': case 'd': case 'D': if (directionRef.current !== 'LEFT') setDirection('RIGHT'); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasStarted, isPaused, gameOver]);

  useEffect(() => { directionRef.current = direction; }, [direction]);

  useEffect(() => {
    if (!hasStarted || isPaused || gameOver) return;
    const moveSnake = () => {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = { ...head };
        switch (direction) {
          case 'UP': newHead.y -= 1; break;
          case 'DOWN': newHead.y += 1; break;
          case 'LEFT': newHead.x -= 1; break;
          case 'RIGHT': newHead.x += 1; break;
        }
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true); return prevSnake;
        }
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true); return prevSnake;
        }
        const newSnake = [newHead, ...prevSnake];
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const newScore = s + 1;
            if (newScore > highScore) setHighScore(newScore);
            return newScore;
          });
          setFood(generateFood(newSnake));
          // Trigger visual glitch on eat
          setGlitchActive(true);
          setTimeout(() => setGlitchActive(false), 150);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    };
    const speed = Math.max(40, BASE_SPEED - Math.floor(score / 5) * 10);
    const gameLoop = setInterval(moveSnake, speed);
    return () => clearInterval(gameLoop);
  }, [direction, food, gameOver, hasStarted, isPaused, score, highScore, generateFood]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / GRID_SIZE;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, width, height);

    // Draw raw grid
    ctx.strokeStyle = '#111';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath(); ctx.moveTo(i * cellSize, 0); ctx.lineTo(i * cellSize, height); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i * cellSize); ctx.lineTo(width, i * cellSize); ctx.stroke();
    }

    const isFuchsia = themeColor === 'fuchsia';
    const primary = isFuchsia ? '#FF00FF' : '#00FFFF';
    const secondary = isFuchsia ? '#00FFFF' : '#FF00FF';

    // Glitch offset
    const offsetX = glitchActive ? (Math.random() * 4 - 2) : 0;
    const offsetY = glitchActive ? (Math.random() * 4 - 2) : 0;

    // Draw Food (Square, raw)
    ctx.fillStyle = secondary;
    ctx.fillRect(food.x * cellSize + 2 + offsetX, food.y * cellSize + 2 + offsetY, cellSize - 4, cellSize - 4);

    // Draw Snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#FFF' : primary;
      ctx.fillRect(segment.x * cellSize + 1 - offsetX, segment.y * cellSize + 1 - offsetY, cellSize - 2, cellSize - 2);
    });
  }, [snake, food, themeColor, glitchActive]);

  const isFuchsia = themeColor === 'fuchsia';
  const primaryColor = isFuchsia ? 'text-fuchsia-500' : 'text-cyan-500';
  const borderColor = isFuchsia ? 'border-fuchsia-500' : 'border-cyan-500';

  return (
    <div className="flex flex-col items-center font-terminal w-full max-w-[400px]">
      <div className="flex justify-between w-full mb-2 px-1 border-b-2 border-gray-800 pb-2">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">MEM_ALLOC</span>
          <span className={`font-pixel text-xl ${primaryColor}`}>0x{score.toString(16).padStart(4, '0').toUpperCase()}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-500 text-sm">PEAK_MEM</span>
          <span className="font-pixel text-xl text-white">0x{highScore.toString(16).padStart(4, '0').toUpperCase()}</span>
        </div>
      </div>

      <div className={`relative p-1 bg-black border-2 ${borderColor} w-full aspect-square ${glitchActive ? 'animate-pulse' : ''}`}>
        <canvas ref={canvasRef} width={400} height={400} className="w-full h-full block" />

        {!hasStarted && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10 p-4 text-center">
            <h2 className={`font-pixel text-2xl mb-6 ${primaryColor} glitch-text`} data-text="EXECUTE?">EXECUTE?</h2>
            <button onClick={resetGame} className={`px-6 py-2 font-pixel text-xs border-2 ${borderColor} ${primaryColor} hover:bg-white hover:text-black transition-none uppercase`}>
              [Y] START
            </button>
          </div>
        )}

        {isPaused && hasStarted && !gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10">
            <h2 className="font-pixel text-xl text-yellow-500 glitch-text" data-text="PROCESS_SUSPENDED">PROCESS_SUSPENDED</h2>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-10 p-4 text-center">
            <h2 className="font-pixel text-xl text-red-500 mb-4 glitch-text" data-text="FATAL_ERROR">FATAL_ERROR</h2>
            <p className="text-lg text-gray-400 mb-6 font-terminal">ENTITY TERMINATED AT 0x{score.toString(16).padStart(4, '0').toUpperCase()}</p>
            <button onClick={resetGame} className={`px-6 py-2 font-pixel text-xs border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black transition-none uppercase`}>
              REBOOT
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-gray-600 text-sm flex justify-between w-full">
        <span>INPUT: W/A/S/D</span>
        <span>HALT: SPACE</span>
      </div>
    </div>
  );
}
