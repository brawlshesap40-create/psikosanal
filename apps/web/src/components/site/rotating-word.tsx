"use client";

import { useEffect, useState } from "react";

export function RotatingWord({
  words,
  interval = 2200,
}: {
  words: string[];
  interval?: number;
}) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), interval);
    return () => clearInterval(id);
  }, [words.length, interval]);

  return (
    <span key={index} className="word-rotate-item text-gradient-brand inline-block">
      {words[index]}
    </span>
  );
}
