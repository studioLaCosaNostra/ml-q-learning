import { IndexedDBMemory } from "./indexeddb-memory";
const Dexie = require('dexie');
Dexie.dependencies.indexedDB = require('fake-indexeddb');
Dexie.dependencies.IDBKeyRange = require('fake-indexeddb/lib/FDBKeyRange');

describe('IndexedDBMemory', () => {
  test('create', () => {
    new IndexedDBMemory();
  })

  test('single state methods', async () => {
    const memory = new IndexedDBMemory('db2');
    const hasState = await memory.hasState('test');
    expect(hasState).toBe(false);
    await memory.setState('test', [1, 2, 3]);
    const hasState2 = await memory.hasState('test');
    expect(hasState2).toBe(true);
  });

  test('setStateBulk', async () => {
    const memory = new IndexedDBMemory('db3');
    const hasStateTest = await memory.hasState('test');
    expect(hasStateTest).toBe(false);
    const hasStateTest2 = await memory.hasState('test2');
    expect(hasStateTest2).toBe(false);
    await memory.setStateBulk([
      ['test', [1, 2, 3]],
      ['test2', [1]]
    ]);
    const hasStateTest3 = await memory.hasState('test');
    expect(hasStateTest3).toBe(true);
    const hasStateTest4 = await memory.hasState('test2');
    expect(hasStateTest4).toBe(true);
  })

  test('info methods', async () => {
    const infoData = {
      episode: 1,
      trained: false
    };
    const memory = new IndexedDBMemory();
    const hasInfo = await memory.hasInfo();
    expect(hasInfo).toBe(false);
    await memory.setInfo(infoData);
    const hasInfo2 = await memory.hasInfo();
    expect(hasInfo2).toBe(true);
    const info = await memory.getInfo();
    expect(info).toEqual(infoData);
  });
});