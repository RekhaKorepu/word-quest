// Predefined local puzzle data for Phase 1 (no AI integration)
// Each level contains exactly 3 puzzles.
// Each puzzle contains exactly 3 progressively useful hints.

export interface Puzzle {
  id: string;
  question: string;
  answer: string;
  hints: [string, string, string];
}

export interface Level {
  levelNumber: number;
  puzzles: [Puzzle, Puzzle, Puzzle];
}

export const LEVELS: Level[] = [
  {
    levelNumber: 1,
    puzzles: [
      {
        id: 'L1P1',
        question: 'I have hands but cannot clap. What am I?',
        answer: 'clock',
        hints: [
          'You find me on walls or wear me on your wrist.',
          'I help you track time throughout the day.',
          'My hands point to hours and minutes.',
        ],
      },
      {
        id: 'L1P2',
        question: 'The more you take, the more you leave behind. What am I?',
        answer: 'footsteps',
        hints: [
          'Think about what happens when you walk.',
          'I am created by the act of moving forward.',
          'I am the marks left by your feet on the ground.',
        ],
      },
      {
        id: 'L1P3',
        question: 'I speak without a mouth and hear without ears. What am I?',
        answer: 'echo',
        hints: [
          'You often hear me in mountains or large empty spaces.',
          'I repeat what you say back to you.',
          'Sound waves bouncing back create me.',
        ],
      },
    ],
  },
  {
    levelNumber: 2,
    puzzles: [
      {
        id: 'L2P1',
        question: 'I have cities, but no houses live there. I have mountains but no trees grow there. What am I?',
        answer: 'map',
        hints: [
          'You use me to find your way around.',
          'I am a representation of the world on paper or a screen.',
          'I show roads, rivers, and borders.',
        ],
      },
      {
        id: 'L2P2',
        question: 'I go up when rain comes down. What am I?',
        answer: 'umbrella',
        hints: [
          'You carry me on a rainy day.',
          'I keep you dry from above.',
          'I open and close and have a handle.',
        ],
      },
      {
        id: 'L2P3',
        question: 'I have a head, a tail, but never any legs. What am I?',
        answer: 'coin',
        hints: [
          'You use me to buy things.',
          'I am made of metal and am round.',
          'I have two sides called heads and tails.',
        ],
      },
    ],
  },
  {
    levelNumber: 3,
    puzzles: [
      {
        id: 'L3P1',
        question: 'The more you feed me, the more I grow. Give me water and I die. What am I?',
        answer: 'fire',
        hints: [
          'I produce heat and light.',
          'I need fuel like wood or paper to survive.',
          'Water is my greatest enemy.',
        ],
      },
      {
        id: 'L3P2',
        question: 'I have teeth but cannot bite. What am I?',
        answer: 'comb',
        hints: [
          'You use me every morning.',
          'I help keep your hair neat and tidy.',
          'My teeth pass through your hair to untangle it.',
        ],
      },
      {
        id: 'L3P3',
        question: 'I am always in front of you but cannot be seen. What am I?',
        answer: 'future',
        hints: [
          'Think about time.',
          'I am what has not happened yet.',
          'Yesterday is the past, today is the present, and I am the ___.',
        ],
      },
    ],
  },
];

export const TOTAL_LEVELS = LEVELS.length;
