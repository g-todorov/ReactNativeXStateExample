import React from "react";
import { View } from "react-native";
import { Button, Checkbox, Text } from "react-native-paper";
import { useSelector } from "@xstate/react";

import { OnboardingScreenProps } from "../types/navigation";
import { OnboardingStepTwoActor } from "../machines/onboardingStepTwo";

interface Props extends OnboardingScreenProps<"StepTwo"> {
  actorRef?: OnboardingStepTwoActor;
}

export default React.memo(function OnboardingStepTwo({ actorRef }: Props) {
  const state = useSelector(actorRef, (snapshot) => snapshot);

  return (
    <View style={{ padding: 16, flex: 1, justifyContent: "space-between" }}>
      <View>
        <Text variant="headlineSmall" style={{ marginBottom: 12 }}>
          Step two
        </Text>
        <Checkbox.Item
          label="Option 1"
          onPress={() => {
            actorRef?.send({ type: "TOGGLE_OPTION", key: "option1" });
          }}
          status={state?.context.options.option1 ? "checked" : "unchecked"}
        />
        <Checkbox.Item
          label="Option 2"
          onPress={() => {
            actorRef?.send({ type: "TOGGLE_OPTION", key: "option2" });
          }}
          status={state?.context.options.option2 ? "checked" : "unchecked"}
        />
      </View>
      <Button
        mode="contained"
        onPress={() => {
          actorRef?.send({ type: "GO_NEXT" });
        }}
      >
        Next
      </Button>
    </View>
  );
});
