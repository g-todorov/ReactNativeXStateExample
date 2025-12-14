import React, { useState } from "react";
import { View } from "react-native";
import {
  Button,
  Checkbox,
  HelperText,
  MD3LightTheme,
  Text,
} from "react-native-paper";
import { useSelector } from "@xstate/react";
import { useForm } from "@swan-io/use-form";

import { OnboardingScreenProps } from "../types/navigation";
import { OnboardingStepTwoActor } from "../machines/onboardingStepTwo";

interface Props extends OnboardingScreenProps<"StepTwo"> {
  actorRef?: OnboardingStepTwoActor;
}

export default React.memo(function OnboardingStepTwo({ actorRef }: Props) {
  const state = useSelector(actorRef, (snapshot) => snapshot);

  const { Field, submitForm } = useForm({
    option1: {
      strategy: "onSubmit",
      initialValue: state?.context.options.option1,
      validate: (value, { getFieldValue }) => {
        const otherOption = getFieldValue("option2");

        console.log("1", value, otherOption);

        if (value !== true && otherOption !== true) {
          return "At lest one option should be selected.";
        }
      },
    },
    option2: {
      strategy: "onSubmit",
      initialValue: state?.context.options.option2,
      validate: (value, { getFieldValue }) => {
        const otherOption = getFieldValue("option1");

        console.log("2", value, otherOption);

        if (value !== true && otherOption !== true) {
          return "At lest one option should be selected.";
        }
      },
    },
  });

  const handleSubmit = () => {
    submitForm({
      onSuccess: () => {
        actorRef?.send({
          type: "SET_ERROR_MESSAGE",
          message: "",
        });

        actorRef?.send({ type: "GO_NEXT" });
      },
      onFailure: ({ option1, option2 }) => {
        actorRef?.send({
          type: "SET_ERROR_MESSAGE",
          message:
            option1 !== undefined
              ? option1
              : option2 !== undefined
              ? option2
              : "",
        });
      },
    });
  };

  return (
    <View style={{ padding: 16, flex: 1, justifyContent: "space-between" }}>
      <View>
        <Text variant="headlineSmall" style={{ marginBottom: 12 }}>
          Step two
        </Text>
        <Field name="option1">
          {({ error, onChange, value }) => {
            return (
              <Checkbox.Item
                label="Option 1"
                onPress={() => {
                  onChange(!value);
                  actorRef?.send({ type: "TOGGLE_OPTION", key: "option1" });
                }}
                status={
                  state?.context.options.option1 === true
                    ? "checked"
                    : "unchecked"
                }
                uncheckedColor={
                  error !== undefined ? MD3LightTheme.colors.error : undefined
                }
              />
            );
          }}
        </Field>
        <Field name="option2">
          {({ error, onChange, value }) => {
            return (
              <Checkbox.Item
                label="Option 2"
                onPress={() => {
                  onChange(!value);
                  actorRef?.send({ type: "TOGGLE_OPTION", key: "option2" });
                }}
                status={
                  state?.context.options.option2 === true
                    ? "checked"
                    : "unchecked"
                }
                uncheckedColor={
                  error !== undefined ? MD3LightTheme.colors.error : undefined
                }
              />
            );
          }}
        </Field>
        {state?.context.error !== "" && (
          <HelperText type="error" style={{ textAlign: "center" }}>
            {state?.context.error}
          </HelperText>
        )}
      </View>
      <Button mode="contained" onPress={handleSubmit}>
        Next
      </Button>
    </View>
  );
});
