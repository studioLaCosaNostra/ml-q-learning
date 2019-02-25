import { tidy, tensor1d } from "@tensorflow/tfjs-core";

function argMax(array: number[]): number {
  const argMaxResult = tidy(() => {
    const x = tensor1d(array);
    return x.argMax();
  });
  const index = argMaxResult.dataSync()[0];
  argMaxResult.dispose();
  return index;
}

export async function randomPickAction(actionsStats: number[]): Promise<number> {
  return Math.floor(Math.random() * actionsStats.length); // explore
}

export async function greedyPickAction(actionsStats: number[]): Promise<number> {
  const actionIndex = argMax(actionsStats); // exploit
  return actionIndex;
}

export function epsilonGreedyPickAction(epsilon: number = 0.5) {
  return async (actionsStats: number[]): Promise<number> => {
    if (Math.random() <= epsilon) {
      return randomPickAction(actionsStats);
    } else {
      return greedyPickAction(actionsStats);
    }
  };
}

export function decayingEpsilonGreedyPickAction(minEpsilon: number = 0.5, epsilonDecrease = 0.99, episodeDenominator = 1) {
  return async (actionsStats: number[], episode: number): Promise<number> => {
    const epsilon = Math.max(minEpsilon, Math.pow(epsilonDecrease, Math.floor(episode / episodeDenominator)));
    return epsilonGreedyPickAction(epsilon)(actionsStats);
  };
}