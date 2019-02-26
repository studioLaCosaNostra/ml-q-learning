import { ITrainingInfo, IAIDocument } from "../q-learning-agent";

export interface IMemoryAdapter {
  size(): Promise<number>;
  
  setState(stateSerialized: string, actionsStats: number[]): Promise<void>;
  setStateBulk(states: [string, number[]][]): Promise<void>;
  hasState(stateSerialized: string): Promise<boolean>;
  getState(stateSerialized: string): Promise<number[]>;

  setInfo(info: ITrainingInfo): Promise<void>;
  hasInfo(): Promise<boolean>;
  getInfo(): Promise<ITrainingInfo>;

  restore(content: IAIDocument): Promise<void>;
  backup(): Promise<IAIDocument>;
}