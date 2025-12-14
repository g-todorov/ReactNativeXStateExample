import React from "react";
import { View } from "react-native";
import { Button, HelperText, Text, TextInput } from "react-native-paper";
import { useSelector } from "@xstate/react";

import { OnboardingScreenProps } from "../types/navigation";
import { OnboardingStepOneActor } from "../machines/onboardingStepOne";
import { useForm } from "@swan-io/use-form";

interface Props extends OnboardingScreenProps<"StepOne"> {
  actorRef?: OnboardingStepOneActor;
}

export default React.memo(function OnboardingStepOne({ actorRef }: Props) {
  const state = useSelector(actorRef, (snapshot) => snapshot);

  const { Field, submitForm } = useForm({
    name: {
      initialValue: state?.context.name,
      strategy: "onSubmit",
      validate: (value) => {
        if (!value) {
          return "Name is required.";
        }
      },
    },
  });

  const handleSubmit = () => {
    submitForm({
      onSuccess: () => {
        actorRef?.send({ type: "GO_NEXT" });
      },
    });
  };

  return (
    <View style={{ padding: 16, flex: 1, justifyContent: "space-between" }}>
      <View>
        <Text variant="headlineSmall" style={{ marginBottom: 12 }}>
          Step one
        </Text>
        <Field name="name">
          {({ value, onChange, error }) => (
            <>
              <TextInput
                error={!!error}
                autoFocus={true}
                mode="outlined"
                label={"Name"}
                value={value}
                onChangeText={(text) => {
                  onChange(text);
                  actorRef?.send({ type: "SET_NAME", value: text });
                }}
              />
              {error && (
                <HelperText type="error" style={{ textAlign: "center" }}>
                  {error}
                </HelperText>
              )}
            </>
          )}
        </Field>
      </View>
      <Button mode="contained" onPress={handleSubmit}>
        Next
      </Button>
    </View>
  );
});
