import { lazy } from 'react';

export const gamesData = [
  {
    id: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    description: 'Classic three-in-a-row strategy game. Play against a friend or AI.',
    category: 'Puzzle',
    difficulty: 'easy',
    maxPlayers: 2,
    instructions: 'Get three of your marks in a row (horizontal, vertical, or diagonal) before your opponent.',
    controls: 'Click on any empty cell to place your mark.',
    rules: 'Players take turns. X goes first. The first to get 3 in a row wins.',
    component: lazy(() => import('./TicTacToe')),
  },
  {
    id: 'snake',
    title: 'Snake',
    description: 'Guide the snake to eat food and grow without crashing into walls or yourself.',
    category: 'Arcade',
    difficulty: 'medium',
    maxPlayers: 1,
    instructions: 'Eat food to grow and score points. The game ends when you hit a wall or yourself.',
    controls: 'Use Arrow Keys or WASD to move the snake.',
    rules: 'Each food item gives +1 length and +10 points. Speed increases as you grow.',
    component: lazy(() => import('./Snake')),
  },
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Test your memory by matching pairs of cards in this classic brain game.',
    category: 'Puzzle',
    difficulty: 'easy',
    maxPlayers: 1,
    instructions: 'Flip cards to find matching pairs. Match all pairs in the fewest moves.',
    controls: 'Click on cards to flip them.',
    rules: 'Flip two cards per turn. Matching pairs stay face up. Complete all matches to win.',
    component: lazy(() => import('./MemoryMatch')),
  },
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    description: 'Navigate through pipes by flapping at the right time. How far can you go?',
    category: 'Arcade',
    difficulty: 'hard',
    maxPlayers: 1,
    instructions: 'Tap to flap and avoid hitting pipes. Each pipe passed = 1 point.',
    controls: 'Press Space, Click, or Tap to flap.',
    rules: 'Hitting a pipe or the ground ends the game. Try to beat your high score.',
    component: lazy(() => import('./FlappyBird')),
  },
  {
    id: 'breakout',
    title: 'Breakout',
    description: 'Break all the bricks with your ball and paddle in this arcade classic.',
    category: 'Arcade',
    difficulty: 'medium',
    maxPlayers: 1,
    instructions: 'Use the paddle to keep the ball in play and break all bricks.',
    controls: 'Move mouse or use Arrow Keys to move the paddle.',
    rules: 'Each brick broken scores points. Lose a life if the ball falls. Clear all bricks to win.',
    component: lazy(() => import('./Breakout')),
  },
  {
    id: 'pong',
    title: 'Pong',
    description: 'Classic two-player table tennis. Defeat your opponent by scoring points.',
    category: 'Sports',
    difficulty: 'medium',
    maxPlayers: 2,
    instructions: 'Hit the ball past your opponent. First to 7 points wins.',
    controls: 'Player 1: W/S. Player 2: Arrow Up/Down.',
    rules: 'Miss the ball and your opponent scores. First to 7 points wins the match.',
    component: lazy(() => import('./Pong')),
  },
  {
    id: 'rock-paper-scissors',
    title: 'Rock Paper Scissors',
    description: 'The classic hand game. Choose your move and beat the computer!',
    category: 'Strategy',
    difficulty: 'easy',
    maxPlayers: 1,
    instructions: 'Choose Rock, Paper, or Scissors. Rock beats Scissors, Scissors beats Paper, Paper beats Rock.',
    controls: 'Click on your choice of Rock, Paper, or Scissors.',
    rules: 'Best of 5 rounds wins. Each round is one throw.',
    component: lazy(() => import('./RockPaperScissors')),
  },
  {
    id: 'game-2048',
    title: '2048',
    description: 'Merge tiles to reach the 2048 tile in this addictive number puzzle.',
    category: 'Puzzle',
    difficulty: 'medium',
    maxPlayers: 1,
    instructions: 'Combine identical tiles to create higher numbers. Reach 2048 to win!',
    controls: 'Use Arrow Keys to slide all tiles in that direction.',
    rules: 'Tiles of the same number merge into one. New tiles appear each move. Game over when the grid is full.',
    component: lazy(() => import('./Game2048')),
  },
  {
    id: 'sudoku',
    title: 'Sudoku',
    description: 'Fill the 9x9 grid so every row, column, and 3x3 box contains digits 1-9.',
    category: 'Puzzle',
    difficulty: 'hard',
    maxPlayers: 1,
    instructions: 'Fill in the grid with numbers 1-9. Each number can appear only once per row, column, and box.',
    controls: 'Click a cell, then click a number or use keyboard 1-9.',
    rules: 'No repeated numbers in any row, column, or 3x3 box. Use logic to solve.',
    component: lazy(() => import('./Sudoku')),
  },
  {
    id: 'word-guess',
    title: 'Word Guess',
    description: 'Guess the hidden word one letter at a time before your guesses run out.',
    category: 'Puzzle',
    difficulty: 'medium',
    maxPlayers: 1,
    instructions: 'Guess letters to reveal the hidden word. Each wrong guess brings you closer to losing.',
    controls: 'Type letters on your keyboard or click letter buttons.',
    rules: 'You get 6 wrong guesses. Correct guesses reveal all occurrences of that letter.',
    component: lazy(() => import('./WordGuess')),
  },
  {
    id: 'color-match',
    title: 'Color Match',
    description: 'Test your reaction time by identifying if the color matches the word.',
    category: 'Puzzle',
    difficulty: 'easy',
    maxPlayers: 1,
    instructions: 'A color word appears in a color. Decide if the word matches the ink color.',
    controls: 'Click MATCH or NO MATCH, or press Y/N keys.',
    rules: 'Answer as many as you can in 30 seconds. Wrong answers end the game.',
    component: lazy(() => import('./ColorMatch')),
  },
  {
    id: 'fruit-ninja',
    title: 'Fruit Ninja',
    description: 'Slice flying fruits with swipes. Avoid the bombs!',
    category: 'Arcade',
    difficulty: 'medium',
    maxPlayers: 1,
    instructions: 'Swipe across fruits to slice them. Miss 3 fruits and it is game over.',
    controls: 'Click and drag (or tap and swipe on mobile) to slice.',
    rules: 'Each fruit gives points. Hitting a bomb ends the game. Missing fruits costs lives.',
    component: lazy(() => import('./FruitNinja')),
  },
  {
    id: 'endless-runner',
    title: 'Endless Runner',
    description: 'Run as far as you can, dodging obstacles in this fast-paced endless runner.',
    category: 'Arcade',
    difficulty: 'hard',
    maxPlayers: 1,
    instructions: 'Run and jump over obstacles. Collect coins for bonus points.',
    controls: 'Press Space, Click, or Tap to jump. Press Space again for double jump.',
    rules: 'Hitting an obstacle ends the run. Distance = score. Coins add bonus points.',
    component: lazy(() => import('./EndlessRunner')),
  },
  {
    id: 'maze-escape',
    title: 'Maze Escape',
    description: 'Navigate through increasingly complex mazes to find the exit.',
    category: 'Puzzle',
    difficulty: 'medium',
    maxPlayers: 1,
    instructions: 'Guide the ball through the maze to reach the goal. Avoid dead ends!',
    controls: 'Arrow Keys or WASD to move. Touch/swipe on mobile.',
    rules: 'Reach the goal to advance. Each maze gets harder. Timer tracks your speed.',
    component: lazy(() => import('./MazeEscape')),
  },
];

export const categories = [...new Set(gamesData.map((g) => g.category))];

export function getGameById(id) {
  return gamesData.find((g) => g.id === id) || null;
}

export function getGamesByCategory(cat) {
  return cat ? gamesData.filter((g) => g.category === cat) : gamesData;
}

export function searchGames(query) {
  if (!query) return gamesData;
  const q = query.toLowerCase();
  return gamesData.filter(
    (g) =>
      g.title.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q) ||
      g.category.toLowerCase().includes(q)
  );
}
