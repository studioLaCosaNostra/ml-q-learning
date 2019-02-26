# ml-q-learning

  Library implementing the q-learning algorithm and several exploration algorithms.

## Install

`npm install ml-q-learning`

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

## Memory

- [`MapInMemory`](https://github.com/studioLaCosaNostra/ml-q-learning/blob/master/src/memory/map-in-memory.ts)
- [`IndexedDBMemory`](https://github.com/studioLaCosaNostra/ml-q-learning/blob/master/src/memory/indexeddb-memory.ts)

## Pick action strategy

- [`randomPickAction`](https://github.com/studioLaCosaNostra/ml-q-learning/blob/master/src/pick-action-strategy/index.ts#L13)
- [`greedyPickAction`](https://github.com/studioLaCosaNostra/ml-q-learning/blob/master/src/pick-action-strategy/index.ts#L17)
- [`epsilonGreedyPickAction`](https://github.com/studioLaCosaNostra/ml-q-learning/blob/master/src/pick-action-strategy/index.ts#L22)
- [`decayingEpsilonGreedyPickAction`](https://github.com/studioLaCosaNostra/ml-q-learning/blob/master/src/pick-action-strategy/index.ts#L32)

## Example use

`Maze escape`

[src/example/maze-escape.ts](https://github.com/studioLaCosaNostra/ml-q-learning/blob/master/src/example/maze-escape.ts)

```
P - Player
# - Wall
. - Nothing
X - Trap = -200
R - Treasure = 200
F - Finish = 1000
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
