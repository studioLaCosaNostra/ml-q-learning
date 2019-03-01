import { tidy, tensor1d, multinomial } from "@tensorflow/tfjs-core";

export function argMax(array: number[]): number {
  const argMaxTensor = tidy(() => {
    const arrayTensor = tensor1d(array);
    return arrayTensor.argMax();
  });
  const index = argMaxTensor.dataSync()[0];
  argMaxTensor.dispose();
  return index;
}

export function randomPickAction(actionsStats: number[]): number {
  return Math.floor(Math.random() * actionsStats.length); // explore
}

export function greedyPickAction(actionsStats: number[]): number {
  const actionIndex = argMax(actionsStats); // exploit
  return actionIndex;
}

export function epsilonGreedyPickAction(epsilon: number = 0.05) {
  return (actionsStats: number[]): number => {
    if (Math.random() <= epsilon) {
      return randomPickAction(actionsStats);
    } else {
      return greedyPickAction(actionsStats);
    }
  };
}

export function decayingEpsilonGreedyPickAction(minEpsilon: number = 0.05, epsilonDecrease = 0.99, episodeDenominator = 1) {
  return (actionsStats: number[], episode: number): number => {
    const epsilon = Math.max(minEpsilon, Math.pow(epsilonDecrease, Math.floor(episode / episodeDenominator)));
    return epsilonGreedyPickAction(epsilon)(actionsStats);
  };
}

export function softmaxPickAction(actionsStats: number[]) {
  const result = tidy(() => {
    const arrayTensor = tensor1d(actionsStats);
    const softmax = arrayTensor.softmax();
    const argMax = multinomial(softmax, actionsStats.length).argMax();
    return argMax;
  });
  const index = result.dataSync()[0];
  result.dispose();
  return index;
}

export function epsilonSoftmaxGreedyPickAction(epsilon: number = 0.05) {
  return (actionsStats: number[]): number => {
    if (Math.random() <= epsilon) {
      return softmaxPickAction(actionsStats);
    } else {
      return greedyPickAction(actionsStats);
    }
  };
}

export function decayingEpsilonSoftmaxGreedyPickAction(minEpsilon: number = 0.05, epsilonDecrease = 0.99, episodeDenominator = 1) {
  return (actionsStats: number[], episode: number): number => {
    const epsilon = Math.max(minEpsilon, Math.pow(epsilonDecrease, Math.floor(episode / episodeDenominator)));
    return epsilonSoftmaxGreedyPickAction(epsilon)(actionsStats);
  };
}
