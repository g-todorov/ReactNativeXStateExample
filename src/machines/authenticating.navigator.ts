import {
  ActorRefFrom,
  setup,
  sendParent,
  fromPromise,
  fromCallback,
  assign,
  sendTo,
} from "xstate";

import { AuthenticatingParamList } from "../types/navigation";
import { onAuthStateChanged, signInWithPhone } from "../api";
import { AuthUser } from "../types";
import { getNotificationCenterEvent } from "./shared/utils";

export type AuthenticatingMachineActor = ActorRefFrom<
  typeof authenticatingMachine
>;

export const authenticatingMachine = setup({
  types: {
    context: {} as { phoneNumber: string },
    events: {} as
      | { type: "SIGN_IN" }
      | { type: "SET_SIGNED_IN_USER"; user: AuthUser }
      | { type: "NAVIGATE"; screen: keyof AuthenticatingParamList }
      | { type: "SET_PHONE_NUMBER"; phoneNumber: string },
  },
  actors: {
    signIn: fromPromise(
      async ({ input }: { input: { phoneNumber: string } }) => {
        await signInWithPhone(input.phoneNumber);
      },
    ),
    userSubscriber: fromCallback(({ sendBack }) => {
      const subscriber = onAuthStateChanged((user) => {
        if (user) {
          sendBack({ type: "SET_SIGNED_IN_USER", user });
        }
      });

      return subscriber.remove;
    }),
  },
  actions: {
    sendParentSignIn: sendParent(
      (_, { user: { phoneNumber } }: { user: AuthUser }) => {
        return {
          type: "SIGN_IN",
          username: phoneNumber,
        };
      },
    ),
    setPhoneNumber: assign({
      phoneNumber: (_, params: { phoneNumber: string }) => {
        return params.phoneNumber;
      },
    }),
    sendToNotificationCenter: sendTo(({ system }) => {
      return system.get("notificationCenter");
    }, getNotificationCenterEvent),
  },
}).createMachine({
  id: "authenticatingNavigator",
  initial: "idle",
  context: { phoneNumber: "" },
  invoke: {
    src: "userSubscriber",
  },
  on: {
    SET_SIGNED_IN_USER: {
      actions: [
        {
          type: "sendParentSignIn",
          params: ({ event }) => {
            return { user: event.user };
          },
        },
      ],
    },
  },
  states: {
    idle: {
      on: {
        SIGN_IN: {
          target: "signingIn",
        },
        SET_PHONE_NUMBER: {
          actions: [
            {
              type: "setPhoneNumber",
              params: ({ event }) => {
                return { phoneNumber: event.phoneNumber };
              },
            },
          ],
        },
      },
    },
    signingIn: {
      invoke: {
        src: "signIn",
        input: ({ context }) => {
          return { phoneNumber: context.phoneNumber };
        },
        onDone: {
          target: "idle",
        },
        onError: {
          actions: [
            {
              type: "sendToNotificationCenter",
              params: {
                notification: {
                  type: "snackbar",
                  message: "Error while signing in.",
                  severity: "error",
                },
              },
            },
          ],
          target: "idle",
        },
      },
    },
  },
});
