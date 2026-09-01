export const LEVELS = [
  {
    id: "first-trace",
    number: 1,
    name: "First Trace",
    lesson: "Commit a route on the sigil. On the next loop, let your echo hold it while you reach the gate.",
    width: 7,
    height: 5,
    turnLimit: 8,
    maxEchoes: 1,
    start: { x: 1, y: 2 },
    exit: { x: 5, y: 2 },
    sigils: [{ x: 3, y: 1 }],
    walls: [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 5, y: 0 }, { x: 6, y: 0 }, { x: 0, y: 4 }, { x: 6, y: 4 }],
    par: { echoes: 1, turns: 4 }
  },
  {
    id: "split-second",
    number: 2,
    name: "Split Second",
    lesson: "Two sigils need two echoes. Short routes finish early and wait in place.",
    width: 8,
    height: 6,
    turnLimit: 10,
    maxEchoes: 2,
    start: { x: 1, y: 3 },
    exit: { x: 6, y: 3 },
    sigils: [{ x: 2, y: 1 }, { x: 4, y: 4 }],
    walls: [{ x: 3, y: 2 }, { x: 3, y: 3 }, { x: 5, y: 1 }, { x: 5, y: 2 }, { x: 0, y: 0 }, { x: 7, y: 5 }],
    par: { echoes: 2, turns: 7 }
  },
  {
    id: "switchback",
    number: 3,
    name: "Switchback",
    lesson: "Walls preserve every mistake. Use Undo before you commit a trace.",
    width: 9,
    height: 7,
    turnLimit: 12,
    maxEchoes: 2,
    start: { x: 1, y: 5 },
    exit: { x: 7, y: 1 },
    sigils: [{ x: 1, y: 1 }, { x: 6, y: 5 }],
    walls: [
      { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 },
      { x: 4, y: 3 }, { x: 5, y: 3 }, { x: 6, y: 3 },
      { x: 6, y: 1 }, { x: 0, y: 0 }, { x: 8, y: 6 }
    ],
    par: { echoes: 2, turns: 10 }
  },
  {
    id: "long-memory",
    number: 4,
    name: "Long Memory",
    lesson: "A committed echo repeats on the shared clock. Use Wait when timing matters.",
    width: 10,
    height: 7,
    turnLimit: 14,
    maxEchoes: 3,
    start: { x: 1, y: 3 },
    exit: { x: 8, y: 3 },
    sigils: [{ x: 2, y: 1 }, { x: 5, y: 5 }, { x: 7, y: 1 }],
    walls: [
      { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 3, y: 2 },
      { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 3, y: 6 },
      { x: 6, y: 2 }, { x: 6, y: 3 }, { x: 6, y: 4 },
      { x: 0, y: 0 }, { x: 9, y: 6 }
    ],
    par: { echoes: 3, turns: 11 }
  }
];
