import { ActorRefFrom, assign, setup } from "xstate";

import { navigationRef } from "../navigation/NavigationRef";
import { persistOnboardingState } from "./shared/utils";

export type OnboardingStepTwoActor = ActorRefFrom<
  typeof onboardingStepTwoMachine
>;

export interface Context {
  options: { option1: boolean; option2: boolean };
}

export const onboardingStepTwoMachine = setup({
  types: {
    context: {} as Context,
    input: {} as { persistedContext?: Context },
    events: {} as
      | { type: "GO_NEXT" }
      | { type: "TOGGLE_OPTION"; key: keyof Context["options"] },
  },
  actions: {
    toggleOption: assign({
      options: ({ context }, params: { key: keyof Context["options"] }) => {
        return {
          ...context.options,
          [params.key]: !context.options[params.key],
        };
      },
    }),
    persistContext({ context }) {
      persistOnboardingState({
        currentStep: "StepThree",
        key: "stepTwo",
        data: context,
      });
    },
    goNext: () => {
      navigationRef.navigate("Onboarding", { screen: "StepThree" });
    },
  },
}).createMachine({
  id: "onboardingStepTwo",
  initial: "idle",
  context: ({ input }) => {
    return {
      options: {
        option1: input.persistedContext?.options.option1 ?? false,
        option2: input.persistedContext?.options.option2 ?? true,
      },
    };
  },
  states: {
    idle: {
      on: {
        GO_NEXT: { actions: ["goNext", "persistContext"] },
        TOGGLE_OPTION: {
          actions: [
            {
              type: "toggleOption",
              params: ({ event }) => {
                return { key: event.key };
              },
            },
          ],
        },
      },
    },
  },
});
