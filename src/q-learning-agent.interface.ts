import { IMemoryAdapter } from "./memory";
import { IStep, IState } from "./q-learning-agent";

export interface IQLearningAgent<TAction = any> {
  replayMemory: [string, number, number][];
  episode: number;
  trained: boolean;
  actions: TAction[],
  memory: IMemoryAdapter,
  learningRate: number,
  discountFactor: number

  play(state: IState): Promise<IStep<TAction>>;

  reward(step: IStep<TAction>, reward: number): void;

  learn(): Promise<void>;
}