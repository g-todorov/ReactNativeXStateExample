import React from "react";
import { setup, assign, stopChild, fromPromise, sendTo } from "xstate";
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
  OnboardingMachineActor,
  onboardingMachine,
} from "../machines/onboarding.navigator";
import {
  NotificationCenterMachineActor,
  notificationCenterMachine,
} from "../machines/notificationCenter";
import { getCurrentUser, readFromDb, signOut } from "../api";
import { User } from "../types";
import { getNotificationCenterEvent } from "../machines/shared/utils";

export const appMachine = setup({
  types: {
    events: {} as
      | { type: "START_APP" }
      | { type: "SIGN_IN"; username: string }
      | { type: "SIGN_OUT" }
      | { type: "GET_USER" },
    context: {} as {
      user: User | undefined;
      refAuthenticating: AuthenticatingMachineActor | undefined;
      refAuthenticated: AuthenticatedMachineActor | undefined;
      refOnboarding: OnboardingMachineActor | undefined;
      refNotificationCenter: NotificationCenterMachineActor | undefined;
    },
  },
  actors: {
    authenticatingMachine,
    authenticatedMachine,
    notificationCenterMachine,
    onboardingMachine,
    getUser: fromPromise(async () => {
      const currentUser = getCurrentUser();
      const user = await readFromDb(`users/${currentUser?.uid}`);

      return { user };
    }),
    signOut: fromPromise(async () => {
      await signOut();
    }),
  },
  actions: {
    setRefAuthenticating: assign({
      refAuthenticating: ({ spawn, self }) => {
        return spawn("authenticatingMachine", {
          id: "authenticatingMachine",
          input: { parent: self },
        });
      },
    }),
    stopRefAuthenticating: assign({ refAuthenticating: undefined }),
    setRefAuthenticated: assign({
      refAuthenticated: ({ spawn, self }) => {
        return spawn("authenticatedMachine", {
          id: "authenticatedMachine",
          input: { parent: self },
        });
      },
    }),
    stopRefAuthenticated: assign({ refAuthenticating: undefined }),
    setRefOnboarding: assign({
      refOnboarding: ({ spawn, self }) => {
        return spawn("onboardingMachine", {
          id: "onboardingMachine",
          input: { parent: self },
        });
      },
    }),
    stopRefOnboarding: assign({ refOnboarding: undefined }),
    setRefNotificationCenter: assign({
      refNotificationCenter: ({ spawn }) => {
        return spawn("notificationCenterMachine", {
          systemId: "notificationCenter",
        });
      },
    }),
    setUser: assign({
      user: (_, params: { user: User }) => {
        return params.user;
      },
    }),
    sendToNotificationCenter: sendTo(({ system }) => {
      return system.get("notificationCenter");
    }, getNotificationCenterEvent),
  },
  guards: {
    isUserAuthenticated() {
      return getCurrentUser() !== null;
    },
    isUserOnboarded(_, params: { user: User | undefined }) {
      return params.user !== undefined;
    },
  },
}).createMachine({
  id: "application",
  initial: "initializing",
  context: {
    user: undefined,
    refAuthenticating: undefined,
    refAuthenticated: undefined,
    refOnboarding: undefined,
    refNotificationCenter: undefined,
  },
  entry: ["setRefNotificationCenter"],
  states: {
    initializing: {
      on: { START_APP: { target: "authenticating" } },
      always: [
        {
          guard: "isUserAuthenticated",
          target: "gettingUser",
        },
        { target: "authenticating" },
      ],
    },
    authenticating: {
      entry: ["setRefAuthenticating"],
      on: {
        SIGN_IN: {
          target: "gettingUser",
        },
      },
      exit: [stopChild("authenticatingMachine"), "stopRefAuthenticating"],
    },
    authenticated: {
      entry: ["setRefAuthenticated"],
      on: { SIGN_OUT: { target: "signingOut" } },
      exit: [stopChild("authenticatedMachine"), "stopRefAuthenticated"],
    },
    onboarding: {
      entry: ["setRefOnboarding"],
      on: {
        SIGN_OUT: { target: "signingOut" },
        GET_USER: { target: "gettingUser" },
      },
      exit: [stopChild("onboardingMachine"), "stopRefOnboarding"],
    },
    gettingUser: {
      invoke: {
        src: "getUser",
        onDone: [
          {
            guard: {
              type: "isUserOnboarded",
              params: ({ event }) => {
                return { user: event.output.user };
              },
            },
            actions: [
              {
                type: "setUser",
                params: ({ event }) => {
                  return { user: event.output.user as User };
                },
              },
            ],
            target: "authenticated",
          },
          {
            target: "onboarding",
          },
        ],
        onError: {
          actions: [
            {
              type: "sendToNotificationCenter",
              params: ({ event }) => {
                return {
                  notification: {
                    type: "snackbar",
                    message: "Error getting user.",
                    severity: "error",
                  },
                };
              },
            },
          ],
          target: "initializing",
        },
      },
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
