import { QLearningAgent } from './q-learning-agent';
import '@tensorflow/tfjs-node';

describe('Q-Learning', () => {
  test('create Q-Learning agent', () => {
    const agent = new QLearningAgent(['1', 2]);
  });

  test('simple action test', async () => {
    const actionTrue = 'ActionTrue';
    const actionFalse = 'ActionFalse';
    const agent = new QLearningAgent([actionTrue, actionFalse]);
    const step = await agent.play('PlayActionFalse');
    agent.reward(step, step.action === actionFalse ? 1 : -1);
    const step2 = await agent.play('PlayActionTrue');
    agent.reward(step2, step2.action === actionTrue ? 1 : -1);
    const step3 = await agent.play('PlayActionFalse');
    agent.reward(step3, step3.action === actionFalse ? 1 : -1);
    const step4 = await agent.play('PlayActionTrue');
    agent.reward(step4, step4.action === actionTrue ? 1 : -1);
    await agent.learn();
    const step5 = await agent.play('PlayActionFalse');
    expect(step5.action).toBe(actionFalse);
    const step6 = await agent.play('PlayActionTrue');
    expect(step6.action).toBe(actionTrue);
  })
})
