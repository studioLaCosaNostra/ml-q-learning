import { IAIDocument, ITrainingInfo } from "../q-learning-agent";
import { IMemoryAdapter } from "./memory.interface";

export class MapInMemory implements IMemoryAdapter {
    public map = new Map<string, number[]>();
    public trainingInfo: ITrainingInfo | undefined;
  
    async setState(stateSerialized: string, actionsStats: number[]): Promise<void> {
      this.map.set(stateSerialized, actionsStats);
    }
  
    async setStateBulk(states: [string, number[]][]): Promise<void> {
      states.forEach(([stateSerialized, actionsStats]) => this.setState(stateSerialized, actionsStats));
    }
  
    async hasState(stateSerialized: string): Promise<boolean> {
      return this.map.has(stateSerialized);
    }
  
    async getState(stateSerialized: string): Promise<number[]> {
      const value = this.map.get(stateSerialized);
      if (!value) {
        throw new Error(`Missing state ${stateSerialized}`);
      }
      return value;
    }
  
    async eachState(callback: (stateSerialized: string, actionsStats: number[]) => void): Promise<void> {
      this.map.forEach((value, key) => callback(key, value));
    }
  
    async setInfo(info: ITrainingInfo): Promise<void> {
      this.trainingInfo = info;
    }
  
    async hasInfo(): Promise<boolean> {
      return this.trainingInfo !== undefined;
    }
  
    async getInfo(): Promise<ITrainingInfo> {
      if (!this.trainingInfo) {
        throw new Error('Trainig info not initialized.');
      }
      return this.trainingInfo;
    }
  
    async restore(content: IAIDocument) {
      for (let index = 0; index < content.Q.length; index++) {
        const [stateSerialized, actionsStats] = content.Q[index];
        await this.setState(stateSerialized, actionsStats);
      }
      if (content.trainingInfo) {
        await this.setInfo(content.trainingInfo);
      }
    }
  
    async backup(): Promise<IAIDocument> {
      const info = await this.getInfo();
      const context: IAIDocument = {
        Q: [],
        trainingInfo: info
      };
      await this.eachState((stateSerialized: string, actionsStats: number[]) => {
        context.Q.push([stateSerialized, actionsStats]);
      });
      return context;
    }
  }