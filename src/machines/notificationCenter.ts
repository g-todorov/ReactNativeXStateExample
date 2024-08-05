import { ActorRefFrom, enqueueActions, setup } from "xstate";

type NotificationType = "snackbar" | "modal";
type NotificationSeverity = "error" | "success";

interface Snackbar {
  type: Extract<NotificationType, "snackbar">;
  message: string;
  severity: NotificationSeverity;
}

interface Modal {
  type: Extract<NotificationType, "modal">;
  title: string;
  message: string;
}

export type Notification = Snackbar | Modal;

export const notificationCenterMachine = setup({
  types: {
    context: {} as {
      snackbar: {
        type: Extract<NotificationType, "snackbar">;
        message: string;
        severity: NotificationSeverity;
      };
      modal: {
        type: Extract<NotificationType, "modal">;
        title: string;
        message: string;
      };
    },
    events: {} as
      | {
          type: "NOTIFY";
          notification: Notification;
        }
      | { type: "OPEN_SNACKBAR" }
      | { type: "OPEN_MODAL" }
      | { type: "CLOSE" },
  },
}).createMachine({
  context: {
    snackbar: {
      type: "snackbar",
      message: "",
      severity: "error",
    },
    modal: { type: "modal", message: "", title: "" },
  },
  id: "notification",
  initial: "idle",
  on: {
    NOTIFY: {
      actions: enqueueActions(({ event, enqueue }) => {
        if (event.notification.type === "snackbar") {
          enqueue.assign({ snackbar: event.notification });
          enqueue.raise({ type: "OPEN_SNACKBAR" });
        }

        if (event.notification.type === "modal") {
          enqueue.assign({ modal: event.notification });
          enqueue.raise({ type: "OPEN_MODAL" });
        }
      }),
    },
    OPEN_SNACKBAR: {
      target: ".snackbar.opened",
    },
    OPEN_MODAL: {
      target: ".modal.opened",
    },
  },
  type: "parallel",
  states: {
    idle: {},
    snackbar: {
      initial: "closed",
      states: { opened: { on: { CLOSE: { target: "closed" } } }, closed: {} },
    },
    modal: {
      initial: "closed",
      states: { opened: { on: { CLOSE: { target: "closed" } } }, closed: {} },
    },
  },
});

export type NotificationCenterMachineActor = ActorRefFrom<
  typeof notificationCenterMachine
>;
