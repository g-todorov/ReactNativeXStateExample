import { ActorRef, ActorRefFrom, Snapshot, assign, setup } from "xstate";

import { persistOnboardingState } from "./shared/utils";
import { Events as ParentEvents } from "./onboarding.navigator";

type ParentActor = ActorRef<Snapshot<unknown>, ParentEvents>;

export type OnboardingStepThreeActor = ActorRefFrom<
  typeof onboardingStepThreeMachine
>;

export interface Context {
  refParent: ParentActor | undefined;
  choice: "first" | "second" | undefined;
}

export const onboardingStepThreeMachine = setup({
  types: {
    context: {} as Context,
    input: {} as { parent?: ParentActor; persistedContext?: Context },
    events: {} as
      | { type: "FINISH" }
      | { type: "SET_CHOICE"; value: Context["choice"] },
  },
  actors: {},
  actions: {
    sendParentFinish({ context }) {
      context.refParent?.send({ type: "FINISH_ONBOARDING" });
    },
    persistContext({ context }) {
      persistOnboardingState({
        currentStep: "StepThree",
        key: "stepThree",
        data: context,
      });
    },
    setChoice: assign({
      choice: (_, params: { choice: Context["choice"] }) => {
        return params.choice;
      },
    }),
  },
}).createMachine({
  id: "onboardingStepThree",
  initial: "idle",
  context: ({ input }) => {
    return {
      refParent: input.parent,
      choice: input.persistedContext?.choice,
    };
  },
  states: {
    idle: {
      on: {
        FINISH: { actions: ["persistContext", "sendParentFinish"] },
        SET_CHOICE: {
          actions: [
            {
              type: "setChoice",
              params: ({ event }) => {
                return { choice: event.value };
              },
            },
          ],
        },
      },
    },
  },
});
