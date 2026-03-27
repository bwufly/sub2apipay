'use client';

import { useEffect, useState } from 'react';

const rotatingModels = ['GPT-4o', 'Claude', 'Gemini', 'Codex', 'Sora'];

export default function RotatingModel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % rotatingModels.length);
    }, 2400);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <span className="font-mono text-cyan-300">{rotatingModels[index]}</span>
      <span className="animate-pulse text-cyan-300">|</span>
    </>
  );
}
