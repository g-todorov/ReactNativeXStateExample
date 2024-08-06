import React from "react";
import { Snackbar, Text, MD3LightTheme } from "react-native-paper";
import { NotificationCenterMachineActor } from "../machines/notificationCenter";
import { useSelector } from "@xstate/react";

interface Props {
  actor: NotificationCenterMachineActor;
}

export function NotificationSnackbar({ actor }: Props) {
  const state = useSelector(actor, (snapshot) => {
    return snapshot;
  });

  const {
    context: {
      snackbar: { severity, message },
    },
  } = state;

  const isOpen = state.matches({ snackbar: "opened" });

  const isError = severity === "error";

  function onDismissHandler() {
    actor.send({ type: "CLOSE" });
  }

  return (
    <>
      <Snackbar
        visible={isOpen}
        action={{
          label: "Close",
          icon: "close",
          onPress: onDismissHandler,
        }}
        onDismiss={onDismissHandler}
        style={
          isError
            ? { backgroundColor: MD3LightTheme.colors.error }
            : { backgroundColor: MD3LightTheme.colors.primaryContainer }
        }
        theme={{
          colors: {
            inversePrimary: isError
              ? MD3LightTheme.colors.onError
              : MD3LightTheme.colors.onPrimaryContainer,
          },
        }}
      >
        <Text
          style={
            isError
              ? { color: MD3LightTheme.colors.onError }
              : { color: MD3LightTheme.colors.onPrimaryContainer }
          }
        >
          {message}
        </Text>
      </Snackbar>
    </>
  );
}
