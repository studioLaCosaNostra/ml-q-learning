import { greedyPickAction } from './pick-action-strategy';
import { MapInMemory, IMemoryAdapter } from './memory';

export interface ITrainingInfo {
  episode: number;
  trained: boolean;
}

export type IQTable = [string, number[]][];

export interface IAIDocument {
  Q: IQTable;
  trainingInfo: ITrainingInfo;
}

export interface IState {
  toString(): string;
}

export interface IStep<T> {
  action: T;
  historyIndex: number;
  trainingInfo: ITrainingInfo;
}

export class QLearningAgent<TAction = any> {
  private startEpisode: number = 0;
  public replayMemory: [string, number, number][] = [];
  public episode: number = 0;
  public trained = false;

  constructor(
    public actions: TAction[],
    private pickActionStrategy: (actionsStats: number[], episode: number) => Promise<number> = greedyPickAction,
    public memory: IMemoryAdapter = new MapInMemory(),
    public learningRate = 0.1,
    public discountFactor = 0.99,
  ) {
    this.init();
  }

  async init() {
    if (!this.episode) {
      this.startEpisode = await this.memory.hasInfo() ? (await this.memory.getInfo()).episode : 1;
      this.episode = this.startEpisode;
      this.trained = await this.memory.hasInfo() ? (await this.memory.getInfo()).trained : false;
    }
  }

  async play(state: IState): Promise<IStep<TAction>> {
    await this.init();
    const stateSerialized: string = state.toString();
    this.episode += 1;
    await this.createStateIfNotExist(stateSerialized);
    const actionsStats: number[] = await this.memory.getState(stateSerialized);
    const actionIndex = await this.pickActionStrategy(actionsStats, this.episode);
    const index: number = this.replayMemory.push([stateSerialized, actionIndex, 0]) - 1;
    return {
      action: this.actions[actionIndex],
      historyIndex: index,
      trainingInfo: {
        episode: this.episode,
        trained: this.trained
      }
    };
  }

  reward(step: IStep<TAction>, reward: number): void {
    this.replayMemory[step.historyIndex][2] += reward;
  }

  private async createStateIfNotExist(stateSerialized: string): Promise<void> {
    if (!(await this.memory.hasState(stateSerialized))) {
      await this.memory.setState(stateSerialized, Array(this.actions.length).fill(0));
    }
  }

  private async greedyPickAction(stateSerialized: string): Promise<number> {
    const actionsStats: number[] = await this.memory.getState(stateSerialized);
    return greedyPickAction(actionsStats); // exploit
  }

  public async learn(): Promise<void> {
    if (this.replayMemory.length === 0) {
      return;
    }
    const map = new Map();
    let stateSerialized: string = this.replayMemory[0][0];
    for (let index = 1; index < this.replayMemory.length - 1; index++) {
      const action: number = this.replayMemory[index][1];
      const reward: number = this.replayMemory[index][2];
      const stateSerialized2: string = this.replayMemory[index + 1][0];
      const action2 = await this.greedyPickAction(stateSerialized2);
      const actionsStats: number[] = map.get(stateSerialized) || await this.memory.getState(stateSerialized);
      const actionsStats2: number[] = map.get(stateSerialized2) || await this.memory.getState(stateSerialized2);
      // tslint:disable-next-line:max-line-length
      actionsStats[action] = actionsStats[action] + this.learningRate * (reward + (this.discountFactor * actionsStats2[action2]) - actionsStats[action]);
      map.set(stateSerialized, actionsStats);
      stateSerialized = stateSerialized2;
    }
    await this.memory.setStateBulk(Array.from(map));
    await this.newTrainingInfo(this.episode - this.startEpisode);
    this.replayMemory = [];
  }

  private async newTrainingInfo(episode: number): Promise<ITrainingInfo> {
    if (!(await this.memory.hasInfo())) {
      await this.memory.setInfo({
        episode,
        trained: false
      });
    }
    const info = await this.memory.getInfo();
    const newInfo = {
      episode: info.episode + episode,
      trained: info.trained
    };
    await this.memory.setInfo(newInfo);
    return newInfo;
  }
}

