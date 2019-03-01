import '@tensorflow/tfjs-node';
import { argMax, randomPickAction, greedyPickAction, epsilonGreedyPickAction, softmaxPickAction, epsilonSoftmaxGreedyPickAction, decayingEpsilonSoftmaxGreedyPickAction } from ".";

describe('Pick action strategy', () => {
  test('argMax', () => {
    const index = argMax([1, 3, 3, 2]);
    expect(index).toBe(1);
    const index2 = argMax([1, 2, 3, 3, 1]);
    expect(index2).toBe(2);
  });

  test('randomPickAction', async () => {
    const nativeRandom = Math.random;
    Math.random = jest.fn(() => 0);
    const testRandomPickAction = await randomPickAction([0, 0, 0, 0, 0]);
    expect(testRandomPickAction).toBe(0);
    Math.random = jest.fn(() => 0.5);
    const testRandomPickAction2 = await randomPickAction([0, 0, 0, 0, 0]);
    expect(testRandomPickAction2).toBe(2);
    Math.random = jest.fn(() => 0.99);
    const testRandomPickAction3 = await randomPickAction([0, 0, 0, 0, 0]);
    expect(testRandomPickAction3).toBe(4);
    Math.random = nativeRandom.bind(Math);
  });

  test('greedyPickAction', async () => {
    const index = await greedyPickAction([0, 1, 0]);
    expect(index).toBe(1);
  });

  test('epsilonGreedyPickAction', async () => {
    const nativeRandom = Math.random;
    const index = await epsilonGreedyPickAction(0)([1, 0, 2, 5]);
    expect(index).toBe(3);
    Math.random = jest.fn(() => 0.5);
    const index2 = await epsilonGreedyPickAction(0.99)([0, 1, 0, 0, 2]);
    expect(index2).toBe(2);
    Math.random = nativeRandom.bind(Math);
  });

  test('softmaxPickAction', async () => {
    expect(softmaxPickAction).toBeDefined();
    const actionStats = [1, 2, 3];
    const result = softmaxPickAction(actionStats);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(actionStats.length);
  });

  test('epsilonSoftmaxGreedyPickAction', async () => {
    expect(epsilonSoftmaxGreedyPickAction).toBeDefined();
    const actionStats = [1, 2, 3];
    const result = epsilonSoftmaxGreedyPickAction(0.5)(actionStats);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(actionStats.length);
  });

  test('decayingEpsilonSoftmaxGreedyPickAction', async () => {
    expect(decayingEpsilonSoftmaxGreedyPickAction).toBeDefined();
    const actionStats = [1, 2, 3];
    const result = decayingEpsilonSoftmaxGreedyPickAction(0.5)(actionStats, 1000);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThan(actionStats.length);
  });
});