import React from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useSelector } from "@xstate/react";

import { OnboardingScreenProps } from "../types/navigation";
import { OnboardingStepOneActor } from "../machines/onboardingStepOne";

interface Props extends OnboardingScreenProps<"StepOne"> {
  actorRef?: OnboardingStepOneActor;
}

export default React.memo(function OnboardingStepOne({ actorRef }: Props) {
  const state = useSelector(actorRef, (snapshot) => snapshot);

  return (
    <View style={{ padding: 16, flex: 1, justifyContent: "space-between" }}>
      <View>
        <Text variant="headlineSmall" style={{ marginBottom: 12 }}>
          Step one
        </Text>
        <TextInput
          value={state?.context.name ?? ""}
          onChangeText={(text) => {
            actorRef?.send({ type: "SET_NAME", value: text });
          }}
          mode="outlined"
          label={"Name"}
        ></TextInput>
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
