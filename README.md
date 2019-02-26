# ml-q-learning

## Install

`npm install ml-q-learning`

## Example use

`Maze escape`

[src/example/maze-escape.ts](https://github.com/studioLaCosaNostra/ml-q-learning/blob/master/src/example/maze-escape.ts)

```
P - Player
# - Wall
. - Nothing
X - Trap
R - Treasure
F - Finish
```

```bash
Start maze
[ [ 'P', '.', '.', '#', '.', '.', '.', '#', 'R' ],
  [ '.', '#', '.', '#', '.', '.', '.', '#', '.' ],
  [ '.', '#', '.', '#', '.', '#', '.', '#', '.' ],
  [ '.', '#', 'X', '#', '.', '#', '.', '.', '.' ],
  [ '.', '#', '#', '#', 'F', '#', '.', '.', '.' ],
  [ '.', '#', '.', '#', '#', '#', '.', '#', 'X' ],
  [ '.', '.', 'X', '.', '.', '.', '.', '#', '.' ],
  [ '.', '.', '.', '.', '#', '.', '.', '#', 'R' ] ]

...many plays...

-------------------------------
  numberOfPlay: 35702,
  score: 1168
  episode: 3322672
  memorySize: 968
-------------------------------

[ [ '.', '.', '.', '#', '.', '.', '.', '#', '.' ],
  [ '.', '#', '.', '#', '.', '.', '.', '#', '.' ],
  [ '.', '#', '.', '#', '.', '#', '.', '#', '.' ],
  [ '.', '#', 'X', '#', '.', '#', '.', '.', '.' ],
  [ '.', '#', '#', '#', 'P', '#', '.', '.', '.' ],
  [ '.', '#', '.', '#', '#', '#', '.', '#', 'X' ],
  [ '.', '.', 'X', '.', '.', '.', '.', '#', '.' ],
  [ '.', '.', '.', '.', '#', '.', '.', '#', 'R' ] ]
```

## QLearningAgent

```typescript
export class QLearningAgent<TAction = any> implements IQLearningAgent {
  public replayMemory: [string, number, number][] = [];
  public episode: number = 0;
  public trained = false;

  constructor(
    public actions: TAction[],
    private pickActionStrategy: (actionsStats: number[], episode: number) => Promise<number> = greedyPickAction,
    public memory: IMemoryAdapter = new MapInMemory(),
    public learningRate = 0.1,
    public discountFactor = 0.99,
  ) {}

  public async play(state: IState): Promise<IStep<TAction>> {};

  public reward(step: IStep<TAction>, reward: number): void {};

  public async learn(): Promise<void> {};
}
```

