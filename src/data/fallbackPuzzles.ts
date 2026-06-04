export interface GeneratedPuzzle {
  id: string; // Required ID for strict type compatibility with standard Puzzle type
  question: string;
  answer: string;
  hints: [string, string, string];
  difficulty: 'easy' | 'medium';
}

export const FALLBACK_PUZZLES: GeneratedPuzzle[] = [
  // Easy Puzzles
  {
    id: 'FE1',
    question: 'I have a face but no eyes, hands but no arms. What am I?',
    answer: 'clock',
    hints: [
      'I help you tell time.',
      'I have numbers 1 to 12.',
      'You wear me on your wrist or hang me on a wall.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE2',
    question: 'I get wetter the more I dry. What am I?',
    answer: 'towel',
    hints: [
      'You use me after a shower.',
      'I am made of fabric.',
      'I absorb water.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE3',
    question: 'I have keys but open no locks. What am I?',
    answer: 'piano',
    hints: [
      'I am a musical instrument.',
      'My keys are black and white.',
      'You play me with your fingers.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE4',
    question: 'The more you take, the more you leave behind. What am I?',
    answer: 'footsteps',
    hints: [
      'You make them when you walk.',
      'They show where you have been.',
      'You leave them in sand or mud.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE5',
    question: 'What has a head and a tail but no body?',
    answer: 'coin',
    hints: [
      'It is round and made of metal.',
      'You use it as money.',
      'It has a value like a quarter or dime.',
    ],
    difficulty: 'easy',
  },
  // Medium Puzzles
  {
    id: 'FM1',
    question: 'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?',
    answer: 'echo',
    hints: [
      'You hear me in mountains or large empty rooms.',
      'I repeat what you say.',
      'I bounce off surfaces.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM2',
    question: 'What belongs to you, but other people use it more than you do?',
    answer: 'name',
    hints: [
      'You are given it at birth.',
      'It is how people refer to you.',
      'You write it on forms.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM3',
    question: 'I am clean when I am black, and dirty when I am white. What am I?',
    answer: 'chalkboard',
    hints: [
      'You see me in old classrooms.',
      'Teachers write on me.',
      'You use chalk to write on me.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM4',
    question: 'I have a neck but no head. What am I?',
    answer: 'bottle',
    hints: [
      'I hold liquids.',
      'I usually have a cap or cork.',
      'I can be made of glass or plastic.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM5',
    question: 'The person who makes it has no need of it; the person who buys it does not use it for themselves. What am I?',
    answer: 'coffin',
    hints: [
      'It is associated with funerals.',
      'It goes under the ground.',
      'It holds a deceased person.',
    ],
    difficulty: 'medium',
  },
];
