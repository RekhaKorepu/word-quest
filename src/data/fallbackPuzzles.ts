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
  {
    id: 'FE6',
    question: 'I am full of holes but still hold water. What am I?',
    answer: 'sponge',
    hints: [
      'You use me to clean dishes.',
      'I am soft and squishy.',
      'I soak up water in the bathroom.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE7',
    question: 'What has legs but cannot walk?',
    answer: 'table',
    hints: [
      'You eat your meals on it.',
      'It usually has four legs.',
      'It has a flat top surface.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE8',
    question: 'I have a thumb and four fingers, but I am not alive. What am I?',
    answer: 'glove',
    hints: [
      'You wear me on your hand.',
      'I keep your fingers warm in winter.',
      'I am made of wool, leather, or rubber.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE9',
    question: 'What is easy to get into but hard to get out of?',
    answer: 'trouble',
    hints: [
      'It happens when you break the rules.',
      'You might get grounded if you are in it.',
      'It rhymes with double.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE10',
    question: 'What goes up but never comes down?',
    answer: 'age',
    hints: [
      'It increases every birthday.',
      'You get older, not younger.',
      'It is measured in years.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE11',
    question: 'What goes up when rain comes down?',
    answer: 'umbrella',
    hints: [
      'It protects you from getting wet.',
      'You hold it above your head.',
      'It folds up when dry.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE12',
    question: 'If you speak my name, I am gone. What am I?',
    answer: 'silence',
    hints: [
      'I am the absence of sound.',
      'You find me in a quiet library.',
      'Shh! makes me return.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE13',
    question: 'What has one eye but cannot see?',
    answer: 'needle',
    hints: [
      'You use me for sewing.',
      'You thread me.',
      'I am very sharp and made of metal.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE14',
    question: 'I am tall when I am young, and short when I am old. What am I?',
    answer: 'candle',
    hints: [
      'I give off light when lit.',
      'I am made of wax.',
      'I have a wick in the middle.',
    ],
    difficulty: 'easy',
  },
  {
    id: 'FE15',
    question: 'What has a bark but no bite, and leaves but no pages?',
    answer: 'tree',
    hints: [
      'I grow in forests and parks.',
      'Birds build nests in my branches.',
      'I produce oxygen for you to breathe.',
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
  {
    id: 'FM6',
    question: 'What has cities but no houses, forests but no trees, and water but no fish?',
    answer: 'map',
    hints: [
      'I help you find directions.',
      'I am a drawing of the world.',
      'GPS has mostly replaced my paper form.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM7',
    question: 'I am always hungry, I must always be fed. The finger I touch will soon turn red. What am I?',
    answer: 'fire',
    hints: [
      'I produce heat and light.',
      'Keep me away from dry wood or paper.',
      'Water is my worst enemy.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM8',
    question: 'What can you catch but not throw?',
    answer: 'cold',
    hints: [
      'It makes you sneeze and cough.',
      'It is a mild viral illness.',
      'You might need a tissue.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM9',
    question: 'What build bridges of silver and crowns of gold?',
    answer: 'dentist',
    hints: [
      'A medical professional who cares for teeth.',
      'They fill cavities.',
      'They recommend brushing twice a day.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM10',
    question: 'I have no life, but I can die. What am I?',
    answer: 'battery',
    hints: [
      'I power your phone and remote control.',
      'You can recharge some of my types.',
      'I hold electrical energy.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM11',
    question: 'I am light as a feather, yet the strongest person cannot hold me for much more than a minute. What am I?',
    answer: 'breath',
    hints: [
      'You do this constantly to live.',
      'You take a deep one to calm down.',
      'You hold it when underwater.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM12',
    question: 'What goes through towns and over hills, but never moves?',
    answer: 'road',
    hints: [
      'Cars and trucks drive on me.',
      'I am paved with asphalt or concrete.',
      'I connect different cities.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM13',
    question: 'What has keys but no locks, space but no room, and you can enter but cannot go inside?',
    answer: 'keyboard',
    hints: [
      'You use me to type on a computer.',
      'I have letters, numbers, and an Enter key.',
      'I can be mechanical or virtual.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM14',
    question: 'I run cold and hot, but have no legs. I can run fast or slow, but never walk. What am I?',
    answer: 'water',
    hints: [
      'You drink me to stay hydrated.',
      'I fall from the sky as rain.',
      'I freeze to become ice.',
    ],
    difficulty: 'medium',
  },
  {
    id: 'FM15',
    question: 'I can be cracked, made, told, and played. What am I?',
    answer: 'joke',
    hints: [
      'I am meant to make you laugh.',
      'Stand-up comedians tell me.',
      'A funny story or punchline.',
    ],
    difficulty: 'medium',
  },
];
