import React from "react";
import { setup, assign, stopChild, fromPromise } from "xstate";
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
import { getCurrentUser, signOut } from "../api";

export const appMachine = setup({
  types: {
    events: {} as
      | { type: "START_APP" }
      | { type: "SIGN_IN"; username: string }
      | { type: "SIGN_OUT" },
    context: {} as {
      username: string;
      refAuthenticating: AuthenticatingMachineActor | null;
      refAuthenticated: AuthenticatedMachineActor | null;
      refNotificationCenter: NotificationCenterMachineActor | undefined;
    },
  },
  actors: {
    authenticatingMachine,
    authenticatedMachine,
    notificationCenterMachine,
    signOut: fromPromise(async () => {
      const result = await signOut();
      return result as { status: string };
    }),
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
  guards: {
    isUserAuthenticated() {
      return getCurrentUser() !== null;
    },
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
      always: [
        {
          guard: "isUserAuthenticated",
          target: "authenticated",
          actions: [
            {
              type: "setUsername",
              params: () => {
                return { username: getCurrentUser()?.phoneNumber ?? "" };
              },
            },
          ],
        },
        { target: "authenticating" },
      ],
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
      on: { SIGN_OUT: { target: "signingOut" } },
      exit: ["stopRefAuthenticated"],
    },
    signingOut: {
      invoke: { src: "signOut", onDone: { target: "authenticating" } },
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
