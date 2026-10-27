import React, { useMemo } from 'react';
import './DeterministicQRCodeSVG.css';

export default function DeterministicQRCodeSVG({ value = '', size = 160 }) {
  const gridSize = 25;
  const matrix = useMemo(() => {
    const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
    const reserved = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));

    const placeFinder = (rowOffset, colOffset) => {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const rr = rowOffset + r;
          const cc = colOffset + c;
          if (rr >= 0 && rr < gridSize && cc >= 0 && cc < gridSize) {
            reserved[rr][cc] = true;
            const inOuter = r >= 0 && r <= 6 && c >= 0 && c <= 6 && (r === 0 || r === 6 || c === 0 || c === 6);
            const inInner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            grid[rr][cc] = inOuter || inInner;
          }
        }
      }
    };

    placeFinder(0, 0);
    placeFinder(0, gridSize - 7);
    placeFinder(gridSize - 7, 0);

    for (let r = 16; r <= 20; r++) {
      for (let c = 16; c <= 20; c++) {
        reserved[r][c] = true;
        const border = r === 16 || r === 20 || c === 16 || c === 20;
        const center = r === 18 && c === 18;
        grid[r][c] = border || center;
      }
    }

    for (let i = 8; i < gridSize - 8; i++) {
      reserved[6][i] = true;
      reserved[i][6] = true;
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }

    let hashA = 2166136261;
    let hashB = 16777619;
    const str = String(value || 'maintainiq');
    for (let i = 0; i < str.length; i++) {
      const ch = str.charCodeAt(i);
      hashA ^= ch;
      hashA = Math.imul(hashA, 16777619);
      hashB = (hashB + ch * (i + 1)) | 0;
    }

    let step = 1;
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (!reserved[r][c]) {
          const charCode = str.charCodeAt((r * gridSize + c) % str.length);
          const v = ((hashA >>> (step % 16)) ^ (hashB >>> ((r + c) % 13)) ^ (charCode * (r + 3) * (c + 7))) & 3;
          grid[r][c] = v === 0 || v === 2;
          step++;
        }
      }
    }
    return grid;
  }, [value]);

  return (
    <svg
      className="qr-code-svg"
      width={size}
      height={size}
      viewBox={`0 0 ${gridSize} ${gridSize}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label={`QR Code for ${value}`}
    >
      <rect width={gridSize} height={gridSize} fill="#ffffff" />
      {matrix.map((row, rIdx) =>
        row.map((cell, cIdx) =>
          cell ? <rect key={`${rIdx}-${cIdx}`} x={cIdx} y={rIdx} width={1} height={1} fill="#0f172a" /> : null
        )
      )}
    </svg>
  );
}
