import React from "react";
import { setup, assign, stopChild } from "xstate";
import { createActorContext, useSelector } from "@xstate/react";
import {
  AuthenticatingMachineActor,
  authenticatingMachine,
} from "../machines/authenticating.navigator";
import {
  AuthenticatedMachineActor,
  authenticatedMachine,
} from "../machines/authenticated.navigator";
import {
  NotificationCenterMachineActor,
  notificationCenterMachine,
} from "../machines/notificationCenter";

export const appMachine = setup({
  types: {
    events: {} as { type: "START_APP" } | { type: "SIGN_IN"; username: string },
    context: {} as {
      username: string;
      refAuthenticating: AuthenticatingMachineActor | null;
      refAuthenticated: AuthenticatedMachineActor | null;
      refNotificationCenter: NotificationCenterMachineActor | undefined;
    },
  },
  actions: {
    setRefAuthenticating: assign({
      refAuthenticating: ({ spawn, self }) => {
        return spawn("authenticatingMachine", { input: { parent: self } });
      },
    }),
    stopRefAuthenticating() {
      stopChild("refAuthenticating");
    },
    setRefAuthenticated: assign({
      refAuthenticated: ({ spawn, self }) => {
        return spawn("authenticatedMachine", { input: { parent: self } });
      },
    }),
    stopRefAuthenticated() {
      stopChild("refAuthenticated");
    },
    setRefNotificationCenter: assign({
      refNotificationCenter: ({ spawn }) => {
        return spawn("notificationCenterMachine", {
          systemId: "notificationCenter",
        });
      },
    }),
    setUsername: assign({
      username: (_, { username }: { username: string }) => {
        return username;
      },
    }),
  },
  actors: {
    authenticatingMachine,
    authenticatedMachine,
    notificationCenterMachine,
  },
}).createMachine({
  id: "application",
  initial: "initializing",
  context: {
    username: "",
    refAuthenticating: null,
    refAuthenticated: null,
    refNotificationCenter: undefined,
  },
  states: {
    initializing: {
      entry: "setRefNotificationCenter",
      on: { START_APP: { target: "authenticating" } },
    },
    authenticating: {
      entry: ["setRefAuthenticating"],
      on: {
        SIGN_IN: {
          actions: [
            {
              type: "setUsername",
              params: ({ event: { username } }) => {
                return { username };
              },
            },
          ],
          target: "authenticated",
        },
      },
      exit: ["stopRefAuthenticating"],
    },
    authenticated: {
      entry: ["setRefAuthenticated"],
      exit: ["stopRefAuthenticated"],
    },
  },
});

export const AppContext = createActorContext(appMachine);

export function AppProvider({ children }: React.PropsWithChildren<unknown>) {
  return <AppContext.Provider>{children}</AppContext.Provider>;
}

export function useApp() {
  const actorRef = AppContext.useActorRef();
  const state = useSelector(actorRef, (snapshot) => {
    return snapshot;
  });

  return {
    state,
    send: actorRef.send,
  };
}
