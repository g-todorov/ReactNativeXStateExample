import { ActorRefFrom, assign, setup } from "xstate";

import { navigationRef } from "../navigation/NavigationRef";
import { persistOnboardingState } from "./shared/utils";

export type OnboardingStepOneActor = ActorRefFrom<
  typeof onboardingStepOneMachine
>;

export interface Context {
  name: string;
}

export const onboardingStepOneMachine = setup({
  types: {
    events: {} as { type: "GO_NEXT" } | { type: "SET_NAME"; value: string },
    context: {} as Context,
    input: {} as { persistedContext?: Context },
  },
  actors: {},
  actions: {
    setName: assign({
      name: (_, params: { value: string }) => {
        return params.value;
      },
    }),
    persistContext({ context }) {
      persistOnboardingState({
        currentStep: "StepTwo",
        key: "stepOne",
        data: context,
      });
    },
    goNext() {
      navigationRef.navigate("Onboarding", { screen: "StepTwo" });
    },
  },
}).createMachine({
  id: "onboardingStepOne",
  initial: "idle",
  context: ({ input }) => {
    return { name: input.persistedContext?.name ?? "" };
  },
  states: {
    idle: {
      on: {
        GO_NEXT: { actions: ["goNext", "persistContext"] },
        SET_NAME: {
          actions: [
            {
              type: "setName",
              params: ({ event }) => {
                return { value: event.value };
              },
            },
          ],
        },
      },
    },
  },
});
