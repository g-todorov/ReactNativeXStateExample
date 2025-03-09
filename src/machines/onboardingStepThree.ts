import { ActorRefFrom, assign, sendParent, setup } from "xstate";
import { persistOnboardingState } from "./shared/utils";

export type OnboardingStepThreeActor = ActorRefFrom<
  typeof onboardingStepThreeMachine
>;

export interface Context {
  choice: "first" | "second";
}

export const onboardingStepThreeMachine = setup({
  types: {
    context: {} as Context,
    input: {} as { persistedContext?: Context },
    events: {} as
      | { type: "FINISH" }
      | { type: "SET_CHOICE"; value: Context["choice"] },
  },
  actors: {},
  actions: {
    sendParentFinish: sendParent({ type: "FINISH_ONBOARDING" }),
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
    return { choice: input.persistedContext?.choice ?? "first" };
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
