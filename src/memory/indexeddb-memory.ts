import Dexie from 'dexie';
import { ITrainingInfo, IAIDocument, IQTable } from '../q-learning-agent';
import { IMemoryAdapter } from './memory.interface';

export interface StateInfo {
  stateSerialized: string;
  stateStats: number[];
}

class MemoryDatabase extends Dexie {
  public states!: Dexie.Table<StateInfo, string>;
  public info!: Dexie.Table<ITrainingInfo, number>;

  public constructor(name: string = 'MemoryDatabase') {
    super(name);
    this.version(1).stores({
      states: '&stateSerialized',
      info: '++id'
    });
  }
}

export class IndexedDBMemory implements IMemoryAdapter {
  private db: MemoryDatabase;

  constructor(dbName?: string) {
    this.db = new MemoryDatabase(dbName);
  }

  async setState(stateSerialized: string, stateStats: number[]): Promise<void> {
    await this.db.states.put({
      stateSerialized,
      stateStats
    });
  }

  async setStateBulk(states: [string, number[]][]): Promise<void> {
    const bulkPut = states.map(([stateSerialized, stateStats]: [string, number[]]) => ({
      stateSerialized,
      stateStats
    }));
    await this.db.states.bulkPut(bulkPut);
  }

  async hasState(stateSerialized: string): Promise<boolean> {
    const stateInfo: StateInfo | undefined = await this.db.states.get(stateSerialized);
    return Boolean(stateInfo);
  }

  async getState(stateSerialized: string): Promise<number[]> {
    const stateInfo: StateInfo | undefined = await this.db.states.get(stateSerialized);
    if (!stateInfo) {
      throw new Error(`Missing state ${stateSerialized}`);
    }
    return stateInfo.stateStats;
  }

  async eachState(callback: (stateSerialized: string, stateStats: number[]) => void): Promise<void> {
    await this.db.states.each((stateInfo: StateInfo) => {
      callback(stateInfo.stateSerialized, stateInfo.stateStats);
    });
  }

  async setInfo(info: ITrainingInfo): Promise<void> {
    const hasInfo = await this.hasInfo();
    if (!hasInfo) {
      await this.db.info.put(info);
    } else {
      await this.db.info.update(1, info);
    }
  }

  async hasInfo(): Promise<boolean> {
    const info: ITrainingInfo | undefined = await this.db.info.get(1);
    return Boolean(info);
  }

  async getInfo(): Promise<ITrainingInfo> {
    const info: ITrainingInfo | undefined = await this.db.info.get(1);
    if (!info) {
      throw new Error('Missing training info.');
    }
    return info;
  }

  async restore(content: IAIDocument) {
    const bulkPut = [];
    for (let index = 0; index < content.Q.length; index++) {
      const [stateSerialized, stateStats] = content.Q[index];
      bulkPut.push({
        stateSerialized,
        stateStats
      });
    }
    await this.db.states.bulkPut(bulkPut);
    await this.setInfo(content.trainingInfo);
  }

  async backup(): Promise<IAIDocument> {
    const info = await this.getInfo();
    const states = await this.db.states.toArray();
    const Q: IQTable = states.map((stateInfo: StateInfo): [string, number[]] => ([stateInfo.stateSerialized, stateInfo.stateStats]));
    const context: IAIDocument = {
      Q,
      trainingInfo: info
    };
    return context;
  }
}
