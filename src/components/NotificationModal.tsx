import React from "react";
import { Portal, Text, Dialog, Button } from "react-native-paper";
import { NotificationCenterMachineActor } from "../machines/notificationCenter";
import { useSelector } from "@xstate/react";

interface Props {
  actor: NotificationCenterMachineActor;
}

export function NotificationModal({ actor }: Props) {
  const state = useSelector(actor, (snapshot) => {
    return snapshot;
  });

  const {
    context: {
      modal: { title, message },
    },
  } = state;

  const isOpen = state.matches({ modal: "opened" });

  function onDismissHandler() {
    actor.send({ type: "CLOSE" });
  }

  return (
    <Portal>
      <Dialog visible={isOpen} onDismiss={onDismissHandler}>
        {title && <Dialog.Title>{title}</Dialog.Title>}
        <Dialog.Content>
          <Text>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismissHandler}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
