import { QLearningAgent } from "../q-learning-agent";
import { decayingEpsilonSoftmaxGreedyPickAction } from "../pick-action-strategy";

enum Action {
  Left,
  Right,
  Up,
  Down
}

enum MazeElements {
  Player = 'P',
  EmptySpace = '.',
  Wall = '#',
  Treasure = 'R',
  Trap = 'X',
  Finish = 'F'
}

type Maze = ('P' | '.' | '#' | 'R' | 'X' | 'F')[][];

const maze: Maze = [
  ['P', '.', '.', '#', '.', '.', '.', '#', 'R'],
  ['.', '#', '.', '#', '.', '.', '.', '#', '.'],
  ['.', '#', '.', '#', '.', '#', '.', '#', '.'],
  ['.', '#', 'X', '#', '.', '#', '.', '.', '.'],
  ['.', '#', '#', '#', 'F', '#', '.', '.', '.'],
  ['.', '#', '.', '#', '#', '#', '.', '#', 'X'],
  ['.', '.', 'X', '.', '.', '.', '.', '#', '.'],
  ['.', '.', '.', '.', '#', '.', '.', '#', 'R']
]

class MazeGame {
  public maze: Maze;
  constructor(maze: Maze) {
    this.maze = this.copyMaze(maze);
  }

  private copyMaze(maze: Maze): Maze {
    return JSON.parse(JSON.stringify(maze))
  }

  private findPlayerPosition(): [number, number] {
    let column = -1;
    const row = this.maze.findIndex((row) => {
      const index = row.findIndex((item, index) => {
        return item === MazeElements.Player;
      });
      if (index !== -1) {
        column = index;
        return true;
      }
      return false;
    });
    return [row, column];
  }

  private canMoveHere([x, y]: [number, number]) {
    const maze = this.maze;
    return x !== -1 && x !== maze.length && y !== -1 && y !== maze[x].length && maze[x][y] !== MazeElements.Wall; 
  }

  private calcReward([x, y]: [number, number]) {
    let reward = -1;
    const maze = this.maze;
    if (this.canMoveHere([x, y])) {
      switch(maze[x][y]) {
        case MazeElements.Treasure:
          reward = 200;
          break;
        case MazeElements.Finish:
          reward = 1000;
          break;
        case MazeElements.Trap:
          reward = -200;
          break;
      }
    } else {
      reward = -10;
    }
    return reward;
  }

  private move([pX, pY]: [number, number] ,[x, y]: [number, number]) {
    this.maze[pX][pY] = '.';
    this.maze[x][y] = 'P';
  }

  performAction(action: Action): [Maze, number, boolean] {
    const playerPosition = this.findPlayerPosition();
    if (playerPosition[0] === -1 || playerPosition[1] === -1) {
      throw new Error('Missing player in maze');
    }
    let positionAfterMove: [number, number];
    switch(action) {
      case Action.Left:
        positionAfterMove = [playerPosition[0], playerPosition[1] - 1];
        break;
      case Action.Down:
        positionAfterMove = [playerPosition[0] + 1, playerPosition[1]];
        break;
      case Action.Right:
        positionAfterMove = [playerPosition[0], playerPosition[1] + 1];
        break;
      case Action.Up:
        positionAfterMove = [playerPosition[0] - 1, playerPosition[1]];
        break;
      default:
        throw new Error('Missing action');
    }
    const reward = this.calcReward(positionAfterMove);
    let finish = false;
    if (this.canMoveHere(positionAfterMove)) {
      finish = this.maze[positionAfterMove[0]][positionAfterMove[1]] === MazeElements.Finish;
      if (finish) {
      }
      this.move(playerPosition, positionAfterMove);
    }
    return [this.maze, reward, finish];
  }
}


async function main() {
  const agent = new QLearningAgent([Action.Left, Action.Right, Action.Up, Action.Down], decayingEpsilonSoftmaxGreedyPickAction(0.05, 0.99, 3000));
  let betsScore = -Infinity;

  console.log('Start maze');
  console.log(maze);
  for (let numberOfPlay = 0; numberOfPlay < Infinity; numberOfPlay++) {
    let score = 0;
    const game = new MazeGame(maze);
    let endGame = false;
    const maxSteps = 10000;
    let stepCount = 0;
    while (!endGame) {
      const step = await agent.play(game.maze.toString());
      const [maze, reward, finish] = game.performAction(step.action);
      await agent.reward(step, reward);
      score += reward;
      if (finish && betsScore < score) {
        betsScore = score;
        const memorySize = await agent.memory.size();
        console.log(`
-------------------------------
  numberOfPlay: ${numberOfPlay},
  score: ${score}
  episode: ${agent.episode}
  memorySize: ${memorySize}
-------------------------------
        `)
        console.log(maze);
      }
      stepCount += 1;
      if (stepCount > maxSteps) {
        break;
      }
      endGame = finish;
    }
    await agent.learn();
  }
}
main();