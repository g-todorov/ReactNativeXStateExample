import React from "react";
import { View } from "react-native";
import { Button, RadioButton, Text } from "react-native-paper";
import { useSelector } from "@xstate/react";

import { OnboardingScreenProps } from "../types/navigation";
import {
  OnboardingStepThreeActor,
  Context,
} from "../machines/onboardingStepThree";

interface Props extends OnboardingScreenProps<"StepThree"> {
  actorRef?: OnboardingStepThreeActor;
  isOnboarding: boolean;
}

export default React.memo(function OnboardingStepThree({
  actorRef,
  isOnboarding,
}: Props) {
  const state = useSelector(actorRef, (snapshot) => snapshot);

  return (
    <View style={{ padding: 16, flex: 1, justifyContent: "space-between" }}>
      <View>
        <Text variant="headlineSmall" style={{ marginBottom: 12 }}>
          Step three
        </Text>
        <RadioButton.Group
          onValueChange={(newValue) => {
            actorRef?.send({
              type: "SET_CHOICE",
              value: newValue as Context["choice"],
            });
          }}
          value={state?.context.choice ?? ""}
        >
          <View
            style={{
              flexDirection: "row-reverse",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Text>First</Text>
            <RadioButton value="first" />
          </View>
          <View
            style={{
              flexDirection: "row-reverse",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Text>Second</Text>
            <RadioButton value="second" />
          </View>
        </RadioButton.Group>
      </View>
      <Button
        mode="contained"
        onPress={() => {
          actorRef?.send({ type: "FINISH" });
        }}
        loading={isOnboarding}
      >
        Finish
      </Button>
    </View>
  );
});
