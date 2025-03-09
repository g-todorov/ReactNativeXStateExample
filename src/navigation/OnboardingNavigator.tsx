import * as React from "react";
import { useSelector } from "@xstate/react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OnboardingBar } from "../components/TopBars";
import { OnboardingParamList, RootStackScreenProps } from "../types/navigation";
import { OnboardingMachineActor } from "../machines/onboarding.navigator";
import OnboardingStepOne from "../screens/OnboardingStepOne";
import OnboardingStepTwo from "../screens/OnboardingStepTwo";
import OnboardingStepThree from "../screens/OnboardingStepThree";

const Stack = createNativeStackNavigator<OnboardingParamList>();

interface Props extends RootStackScreenProps<"Onboarding"> {
  actorRef?: OnboardingMachineActor;
}

export function OnboardingNavigator({ navigation, actorRef }: Props) {
  const state = useSelector(actorRef, (snapshot) => {
    return snapshot;
  });

  return (
    <Stack.Navigator
      initialRouteName={
        state?.context.persistedOnboardingState?.currentStep ?? "StepOne"
      }
      screenOptions={{
        header: (props) => {
          return (
            <OnboardingBar
              {...props}
              onGoBackPress={() => {
                actorRef?.send({ type: "GO_BACK" });
              }}
              onLogoutPress={() => {
                actorRef?.send({ type: "SIGN_OUT" });
              }}
            />
          );
        },
      }}
    >
      <Stack.Screen name="StepOne">
        {(props) => {
          return (
            <OnboardingStepOne
              actorRef={state?.context.refStepOne}
              {...props}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="StepTwo">
        {(props) => {
          return (
            <OnboardingStepTwo
              actorRef={state?.context.refStepTwo}
              {...props}
            />
          );
        }}
      </Stack.Screen>
      <Stack.Screen name="StepThree">
        {(props) => {
          return (
            <OnboardingStepThree
              actorRef={state?.context.refStepThree}
              isOnboarding={state?.matches({ onboarding: "loading" }) ?? false}
              {...props}
            />
          );
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
