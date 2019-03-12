import { greedyPickAction } from './pick-action-strategy';
import { MapInMemory, IMemoryAdapter } from './memory';
import { IQLearningAgent } from './q-learning-agent.interface';

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

export { IQLearningAgent };

export class QLearningAgent<TAction = any> implements IQLearningAgent {
  private startEpisode: number = 0;
  public replayMemory: [string, number, number][] = [];
  public episode: number = 0;
  public trained = false;

  constructor(
    public actions: TAction[],
    protected pickActionStrategy: (actionsStats: number[], episode: number) => Promise<number> | number = greedyPickAction,
    public memory: IMemoryAdapter = new MapInMemory(),
    public learningRate = 0.1,
    public discountFactor = 0.99,
  ) {
    this.init();
  }

  private async init() {
    if (!this.episode) {
      this.startEpisode = await this.memory.hasInfo() ? (await this.memory.getInfo()).episode : 1;
      this.episode = this.startEpisode;
      this.trained = await this.memory.hasInfo() ? (await this.memory.getInfo()).trained : false;
    }
  }

  public async play(state: IState): Promise<IStep<TAction>> {
    await this.init();
    const stateSerialized: string = state.toString();
    this.episode += 1;
    const actionIndex = await this.chooseActionAlgorithm(stateSerialized);
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

  protected async chooseActionAlgorithm(stateSerialized: string): Promise<number> {
    await this.createStateIfNotExist(stateSerialized);
    const actionsStats: number[] = await this.memory.getState(stateSerialized);
    const actionIndex = await this.pickActionStrategy(actionsStats, this.episode);
    return actionIndex;
  }

  public reward(step: IStep<TAction>, reward: number): void {
    this.replayMemory[step.historyIndex][2] += reward;
  }

  protected async createStateIfNotExist(stateSerialized: string): Promise<void> {
    if (!(await this.memory.hasState(stateSerialized))) {
      await this.memory.setState(stateSerialized, Array(this.actions.length).fill(0));
    }
  }

  protected async greedyPickAction(stateSerialized: string): Promise<number> {
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
      const stateSerializedPrime: string = this.replayMemory[index + 1][0];
      const [stateSerializedToUpdate, actionsStats] = await this.learningAlgorithm(action, reward, stateSerialized, stateSerializedPrime)
      map.set(stateSerializedToUpdate, actionsStats);
      stateSerialized = stateSerializedPrime;
    }
    await this.memory.setStateBulk(Array.from(map));
    await this.updateTrainingInfo();
    this.replayMemory = [];
  }

  protected async learningAlgorithm(action: number, reward: number, stateSerialized: string, stateSerializedPrime: string): Promise<[string, number[]]> {
    const actionPrime = await this.greedyPickAction(stateSerializedPrime);
    const actionsStats: number[] = await this.memory.getState(stateSerialized);
    const actionsStatsPrime: number[] = await this.memory.getState(stateSerializedPrime);
    // tslint:disable-next-line:max-line-length
    actionsStats[action] = actionsStats[action] + this.learningRate * (reward + (this.discountFactor * actionsStatsPrime[actionPrime]) - actionsStats[action]);
    return [stateSerialized, actionsStats];
  }

  private async updateTrainingInfo(): Promise<ITrainingInfo> {
    if (!(await this.memory.hasInfo())) {
      await this.memory.setInfo({
        episode: this.episode,
        trained: false
      });
    }
    const info = await this.memory.getInfo();
    const newEpisode = info.episode + this.episode - this.startEpisode;
    const newInfo = {
      episode: newEpisode,
      trained: info.trained
    };
    await this.memory.setInfo(newInfo);
    this.startEpisode = newEpisode;
    this.episode = newEpisode;
    return newInfo;
  }
}

