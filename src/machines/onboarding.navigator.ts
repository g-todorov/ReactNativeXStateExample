import {
  ActorRefFrom,
  setup,
  assign,
  fromPromise,
  initialTransition,
  sendTo,
  ActorRef,
  Snapshot,
} from "xstate";

import { navigationSubscriber } from "./shared/actors";
import {
  Context as StepOneContext,
  onboardingStepOneMachine,
  OnboardingStepOneActor,
} from "./onboardingStepOne";
import {
  Context as StepTwoContext,
  onboardingStepTwoMachine,
  OnboardingStepTwoActor,
} from "./onboardingStepTwo";
import {
  Context as StepThreeContext,
  onboardingStepThreeMachine,
  OnboardingStepThreeActor,
} from "./onboardingStepThree";

import { isNavigatedScreen } from "./shared/guards";
import { OnboardingParamList } from "../types/navigation";
import { navigationRef } from "../navigation/NavigationRef";
import {
  persistOnboardingState,
  PersistedOnboardingState,
  deleteOnboardingState,
  getOnboardingState,
  getNotificationCenterEvent,
} from "./shared/utils";
import { onboard } from "../api";
import { Events as ParentEvents } from "../contexts/useApp";

type ParentActor = ActorRef<Snapshot<unknown>, ParentEvents>;

export type OnboardingMachineActor = ActorRefFrom<typeof onboardingMachine>;

interface Context {
  refParent: ParentActor;
  refStepOne: OnboardingStepOneActor | undefined;
  refStepTwo: OnboardingStepTwoActor | undefined;
  refStepThree: OnboardingStepThreeActor | undefined;
  persistedOnboardingState: PersistedOnboardingState | undefined;
}

export type Events =
  | {
      type: "NAVIGATE";
      screen: keyof OnboardingParamList;
    }
  | { type: "SIGN_OUT" }
  | { type: "GO_BACK" }
  | { type: "FINISH_ONBOARDING" };

export const onboardingMachine = setup({
  types: {
    input: {} as { parent: ParentActor },
    context: {} as Context,
    events: {} as Events,
  },
  actors: {
    navigationSubscriber,
    onboardingStepOneMachine,
    onboardingStepTwoMachine,
    onboardingStepThreeMachine,
    onboard: fromPromise(
      async ({
        input,
      }: {
        input: {
          name: StepOneContext["name"];
          options: StepTwoContext["options"];
          choice: StepThreeContext["choice"];
        };
      }) => {
        await onboard({
          name: input.name,
          options: input.options,
          choice: input.choice,
        });
      },
    ),
  },
  actions: {
    sendToNotificationCenter: sendTo(({ system }) => {
      return system.get("notificationCenter");
    }, getNotificationCenterEvent),
    setRefStepOne: assign({
      refStepOne: ({ spawn, context }) => {
        return (
          context.refStepOne ??
          spawn("onboardingStepOneMachine", {
            id: "onboardingStepOneMachine",
            input: {
              persistedContext: context.persistedOnboardingState?.stepOne,
            },
          })
        );
      },
    }),
    resetRefStepOne: assign({ refStepOne: undefined }),
    setRefStepTwo: assign({
      refStepTwo: ({ spawn, context }) => {
        return (
          context.refStepTwo ??
          spawn("onboardingStepTwoMachine", {
            id: "onboardingStepTwoMachine",
            input: {
              persistedContext: context.persistedOnboardingState?.stepTwo,
            },
          })
        );
      },
    }),
    resetRefStepTwo: assign({ refStepTwo: undefined }),
    setRefStepThree: assign({
      refStepThree: ({ spawn, context, self }) => {
        return (
          context.refStepThree ??
          spawn("onboardingStepThreeMachine", {
            id: "onboardingStepThreeMachine",
            input: {
              parent: self,
              persistedContext: context.persistedOnboardingState?.stepThree,
            },
          })
        );
      },
    }),
    resetRefStepThree: assign({ refStepThree: undefined }),
    sendParentSignOut({ context }) {
      context.refParent.send({ type: "SIGN_OUT" });
    },
    sendParentGetUser({ context }) {
      context.refParent.send({ type: "GET_USER" });
    },
    navigateToOnboardingStep(_, params: { screen: keyof OnboardingParamList }) {
      navigationRef.navigate("Onboarding", { screen: params.screen });
    },
    persistOnboardingStep(_, params: { screen: keyof OnboardingParamList }) {
      persistOnboardingState({ currentStep: params.screen });
    },
    deleteOnboardingState,
  },
  guards: { isNavigatedScreen },
}).createMachine({
  id: "onboardingNavigator",
  initial: "steps",
  type: "parallel",
  context: ({ input }) => {
    const persistedOnboardingState = getOnboardingState();

    return {
      refParent: input.parent,
      refStepOne: undefined,
      refStepTwo: undefined,
      refStepThree: undefined,
      persistedOnboardingState,
    };
  },
  invoke: { src: "navigationSubscriber" },
  on: {
    NAVIGATE: [
      {
        guard: {
          type: "isNavigatedScreen",
          params: ({ event }) => {
            return {
              navigatedScreen: "StepOne",
              screen: event.screen,
            };
          },
        },
        target: ".steps.stepOne",
      },
      {
        guard: {
          type: "isNavigatedScreen",
          params: ({ event }) => {
            return {
              navigatedScreen: "StepTwo",
              screen: event.screen,
            };
          },
        },
        target: ".steps.stepTwo",
      },
      {
        guard: {
          type: "isNavigatedScreen",
          params: ({ event }) => {
            return {
              navigatedScreen: "StepThree",
              screen: event.screen,
            };
          },
        },
        target: ".steps.stepThree",
      },
    ],
    SIGN_OUT: { actions: ["sendParentSignOut"] },
  },
  states: {
    steps: {
      initial: "stepOne",
      states: {
        stepOne: {
          entry: ["setRefStepOne"],
        },
        stepTwo: {
          entry: ["setRefStepTwo"],
          on: {
            GO_BACK: {
              actions: [
                {
                  type: "persistOnboardingStep",
                  params: () => {
                    return { screen: "StepOne" };
                  },
                },
                {
                  type: "navigateToOnboardingStep",
                  params: () => {
                    return { screen: "StepOne" };
                  },
                },
              ],
            },
          },
        },
        stepThree: {
          entry: ["setRefStepThree"],
          on: {
            GO_BACK: {
              actions: [
                {
                  type: "persistOnboardingStep",
                  params: () => {
                    return { screen: "StepTwo" };
                  },
                },
                {
                  type: "navigateToOnboardingStep",
                  params: () => {
                    return { screen: "StepTwo" };
                  },
                },
              ],
            },
            FINISH_ONBOARDING: {
              actions: [
                {
                  type: "persistOnboardingStep",
                  params: () => {
                    return { screen: "StepOne" };
                  },
                },
              ],
              target: "#onboardingNavigator.onboarding.loading",
            },
          },
        },
      },
    },
    onboarding: {
      initial: "idle",
      states: {
        idle: {},
        loading: {
          invoke: {
            src: "onboard",
            input: () => {
              const persistedContext = getOnboardingState();

              const [stepOneInitialState] = initialTransition(
                onboardingStepOneMachine,
                {},
              );
              const [stepTwoInitialState] = initialTransition(
                onboardingStepTwoMachine,
                {},
              );
              const [stepThreeInitialState] = initialTransition(
                onboardingStepThreeMachine,
                {},
              );

              return {
                name:
                  persistedContext?.stepOne?.name ??
                  stepOneInitialState.context.name,
                options:
                  persistedContext?.stepTwo?.options ??
                  stepTwoInitialState.context.options,
                choice:
                  persistedContext?.stepThree?.choice ??
                  stepThreeInitialState.context.choice,
              };
            },
            onDone: {
              actions: ["sendParentGetUser", "deleteOnboardingState"],
              target: "idle",
            },
            onError: {
              actions: [
                {
                  type: "sendToNotificationCenter",
                  params: () => {
                    return {
                      notification: {
                        type: "snackbar",
                        message: "Error onboarding user.",
                        severity: "error",
                      },
                    };
                  },
                },
              ],
              target: "idle",
            },
          },
        },
      },
    },
  },
});
