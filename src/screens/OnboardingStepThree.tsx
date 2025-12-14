import React from "react";
import { View } from "react-native";
import { Button, HelperText, RadioButton, Text } from "react-native-paper";
import { useSelector } from "@xstate/react";

import { OnboardingScreenProps } from "../types/navigation";
import {
  OnboardingStepThreeActor,
  Context,
} from "../machines/onboardingStepThree";
import { useForm } from "@swan-io/use-form";

interface Props extends OnboardingScreenProps<"StepThree"> {
  actorRef?: OnboardingStepThreeActor;
  isOnboarding: boolean;
}

export default React.memo(function OnboardingStepThree({
  actorRef,
  isOnboarding,
}: Props) {
  const state = useSelector(actorRef, (snapshot) => snapshot);

  const { Field, submitForm } = useForm({
    choice: {
      initialValue: state?.context.choice,
      strategy: "onSubmit",
      validate: (value) => {
        if (!value) {
          return "Field is required.";
        }
      },
    },
  });

  const handleSubmit = () => {
    submitForm({
      onSuccess: () => {
        actorRef?.send({ type: "FINISH" });
      },
    });
  };

  return (
    <View style={{ padding: 16, flex: 1, justifyContent: "space-between" }}>
      <View>
        <Text variant="headlineSmall" style={{ marginBottom: 12 }}>
          Step three
        </Text>
        <Field name="choice">
          {({ error, onChange, value }) => {
            return (
              <>
                <RadioButton.Group
                  onValueChange={(newValue) => {
                    onChange(newValue as "first" | "second" | undefined);
                    actorRef?.send({
                      type: "SET_CHOICE",
                      value: newValue as Context["choice"],
                    });
                  }}
                  value={value ?? ""}
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
                <HelperText type="error" style={{ textAlign: "center" }}>
                  {error}
                </HelperText>
              </>
            );
          }}
        </Field>
      </View>
      <Button mode="contained" onPress={handleSubmit} loading={isOnboarding}>
        Finish
      </Button>
    </View>
  );
});
