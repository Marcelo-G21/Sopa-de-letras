// components/WordSearchGame.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import categories from "../data/categories";
import cat from "../assets/gifs/happy-cat.gif";
import successSound from "../assets/sounds/Success.m4a";

const GRID_SIZE = 18;
const DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
];

const generateGrid = (words) => {
  const grid = Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill(""));
  const wordPositions = {};
  const canPlaceWord = (word, r, c, dr, dc) => {
    for (let i = 0; i < word.length; i++) {
      const rr = r + i * dr;
      const cc = c + i * dc;
      if (
        rr < 0 ||
        rr >= GRID_SIZE ||
        cc < 0 ||
        cc >= GRID_SIZE ||
        (grid[rr][cc] && grid[rr][cc] !== word[i])
      )
        return false;
    }
    return true;
  };
  const placeWord = (word) => {
    const w = word.toUpperCase();
    const variants = [w, w.split("").reverse().join("")];
    for (const variant of variants) {
      for (let attempt = 0; attempt < 100; attempt++) {
        const [dr, dc] = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
        const r = Math.floor(Math.random() * GRID_SIZE);
        const c = Math.floor(Math.random() * GRID_SIZE);
        if (canPlaceWord(variant, r, c, dr, dc)) {
          wordPositions[word] = [];
          for (let i = 0; i < variant.length; i++) {
            const rr = r + i * dr;
            const cc = c + i * dc;
            grid[rr][cc] = variant[i];
            wordPositions[word].push([rr, cc]);
          }
          return;
        }
      }
    }
  };
  words.forEach(placeWord);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) grid[r][c] = letters[Math.floor(Math.random() * letters.length)];
    }
  }
  return { grid, wordPositions };
};

const arraysEqual = (a1, a2) => {
  if (a1.length !== a2.length) return false;
  return a1.every((p, i) => p[0] === a2[i][0] && p[1] === a2[i][1]);
};

const WordSearchGame = () => {
  const { name, level } = useParams();
  const navigate = useNavigate();
  const category = categories.find((c) => c.name === name);
  const words = Array.isArray(category?.levels[level]) ? category.levels[level] : [];
  const audioRef = useRef(new Audio(successSound));

  const [grid, setGrid] = useState([]);
  const [wordPositions, setWordPositions] = useState({});
  const [selectedCells, setSelectedCells] = useState([]);
  const [confirmedCells, setConfirmedCells] = useState([]);
  const [foundWords, setFoundWords] = useState([]);
  const isSelecting = useRef(false);
  const selectionDirection = useRef(null);
  const [startCell, setStartCell] = useState(null);
  const [dynamicEnd, setDynamicEnd] = useState(null);

  const cellSize = 32,
    gap = 10,
    padding = 8;

  const resetGame = () => {
    const { grid: g, wordPositions: wp } = generateGrid(words);
    setGrid(g);
    setWordPositions(wp);
    setConfirmedCells([]);
    setFoundWords([]);
    setSelectedCells([]);
    setStartCell(null);
    setDynamicEnd(null);
    selectionDirection.current = null;
    // ... otras reseteadas
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  useEffect(() => {
    if (words.length) resetGame();
  }, [words]);

  const getDirection = (r1, c1, r2, c2) => {
    const dr = r2 - r1;
    const dc = c2 - c1;
    if (dr !== 0) dr > 0 ? dr : -dr;
    if (dc !== 0) dc > 0 ? dc : -dc;
    if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return null;
    const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
    const factor = gcd(Math.abs(dr), Math.abs(dc)) || 1;
    return [dr / factor, dc / factor];
  };

  const handleMouseDown = (r, c) => {
    isSelecting.current = true;
    setStartCell([r, c]);
    setSelectedCells([[r, c]]);
    setDynamicEnd([r, c]);
  };

  const handleMouseEnter = (r, c) => {
    if (!isSelecting.current || !startCell) return;
    const [sr, sc] = startCell;
    const dir = getDirection(sr, sc, r, c);
    if (!dir) return;
    const [dr, dc] = dir;
    const newCells = [];
    let i = 0;
    while (true) {
      const nr = sr + i * dr;
      const nc = sc + i * dc;
      newCells.push([nr, nc]);
      if (nr === r && nc === c) break;
      i++;
    }
    selectionDirection.current = dir;
    setSelectedCells(newCells);
    setDynamicEnd([r, c]);
  };

  const handleMouseUp = () => {
    isSelecting.current = false;
    for (const w of words) {
      const pos = wordPositions[w] || [];
      if (arraysEqual(pos, selectedCells) || arraysEqual([...pos].reverse(), selectedCells)) {
        setConfirmedCells((p) => [...p, ...pos]);
        setFoundWords((p) => [...p, w]);
        break;
      }
    }
    setSelectedCells([]);
    setStartCell(null);
    setDynamicEnd(null);
    selectionDirection.current = null;
  };

  const isConfirmed = (r, c) => confirmedCells.some(([rr, cc]) => rr === r && cc === c);
  const isSelected = (r, c) => selectedCells.some(([rr, cc]) => rr === r && cc === c);
  const getCenter = (r, c) => [
    padding + c * (cellSize + gap) + cellSize / 2,
    padding + r * (cellSize + gap) + cellSize / 2,
  ];

  const allFound = foundWords.length === words.length;

  useEffect(() => {
    if (allFound) {
      audioRef.current.volume = 0.3;
      audioRef.current.play();
    }
  }, [allFound]);

  return (
    <div className="font-cute min-h-screen p-4 select-none">
      <div className="mb-14 flex justify-center gap-4">
        <button onClick={() => navigate("/")} className="rounded bg-[#001858] px-4 py-2 text-white">
          Categorías
        </button>
        <button
          onClick={() => navigate(`/category/${name}`)}
          className="rounded bg-[#001858] px-4 py-2 text-white">
          Niveles
        </button>
      </div>
      <div className="relative flex justify-center gap-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <h2 className="col-span-2 mb-2 text-xl font-bold">
            {name} - Nivel {level}
          </h2>
          {words.map((w) => (
            <div
              key={w}
              className={`flex h-fit w-fit items-center gap-2 rounded-full px-3 py-1 ${foundWords.includes(w) ? "bg-[#A888B5] text-white" : "bg-white text-[#001858]"}`}>
              {" "}
              {w}
            </div>
          ))}
        </div>

        <div className="relative rounded-lg bg-[#f1bece] p-2">
          <svg
            className="pointer-events-none absolute inset-0 z-10"
            width={GRID_SIZE * (cellSize + gap) + gap + padding * 2}
            height={GRID_SIZE * (cellSize + gap) + gap + padding * 2}>
            {foundWords.map((w) => {
              const pos = wordPositions[w] || [];
              const [sx, sy] = getCenter(pos[0][0], pos[0][1]);
              const [ex, ey] = getCenter(pos.at(-1)[0], pos.at(-1)[1]);
              return (
                <line
                  key={w}
                  x1={sx}
                  y1={sy}
                  x2={ex}
                  y2={ey}
                  stroke="#A888B5"
                  strokeWidth={cellSize}
                  strokeLinecap="round"
                />
              );
            })}
            {selectedCells.length > 1 && startCell && dynamicEnd && (
              <line
                x1={getCenter(startCell[0], startCell[1])[0]}
                y1={getCenter(startCell[0], startCell[1])[1]}
                x2={getCenter(dynamicEnd[0], dynamicEnd[1])[0]}
                y2={getCenter(dynamicEnd[0], dynamicEnd[1])[1]}
                stroke="#A888B5"
                strokeWidth={cellSize}
                strokeLinecap="round"
              />
            )}
          </svg>

          <div
            className="relative z-20 grid grid-cols-[repeat(18,min-content)] gap-[10px]"
            onMouseUp={handleMouseUp}>
            {grid.map((row, ri) =>
              row.map((ch, ci) => {
                const sel = isSelected(ri, ci),
                  conf = isConfirmed(ri, ci);
                const bg = conf || sel ? "#A888B5" : "transparent";
                const color = conf ? "#FFF7F3" : sel ? "#FFF7F3" : "#001858";
                return (
                  <div
                    key={`${ri}-${ci}`}
                    onMouseDown={() => handleMouseDown(ri, ci)}
                    onMouseEnter={() => handleMouseEnter(ri, ci)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[18px] font-bold"
                    style={{ backgroundColor: bg, color }}>
                    {ch}
                  </div>
                );
              })
            )}
          </div>

          {allFound && (
            <div className="bg-opacity-50 absolute inset-0 z-30 flex flex-col items-center justify-center bg-transparent backdrop-blur">
              <div className="rounded-lg bg-[#FFF7F3] p-6 text-center">
                <h3 className="mb-4 text-2xl font-bold text-[#624E88]">¡Felicidades! :3</h3>
                <img src={cat} alt="" className="mx-auto" />
                <p className="mb-4 text-[#624E88]">Has encontrado todas las palabras</p>
                <div className="flex justify-center gap-4">
                  <button onClick={resetGame} className="rounded bg-[#624E88] px-4 py-2 text-white">
                    Reintentar
                  </button>
                  <button
                    onClick={() => navigate(`/category/${name}`)}
                    className="rounded bg-[#624E88] px-4 py-2 text-white">
                    Volver a niveles
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordSearchGame;
