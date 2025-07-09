import {
  ActorRefFrom,
  setup,
  fromPromise,
  fromCallback,
  assign,
  sendTo,
  ActorRef,
  Snapshot,
} from "xstate";

import { AuthenticatingParamList } from "../types/navigation";
import { onAuthStateChanged, signInWithPhone } from "../api";
import { AuthUser } from "../types";
import { getNotificationCenterEvent } from "./shared/utils";
import { Events as ParentEvents } from "../contexts/useApp";

type ParentActor = ActorRef<Snapshot<unknown>, ParentEvents>;

export type AuthenticatingMachineActor = ActorRefFrom<
  typeof authenticatingMachine
>;

export const authenticatingMachine = setup({
  types: {
    input: {} as { parent: ParentActor },
    context: {} as { refParent: ParentActor; phoneNumber: string },
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
    sendParentSignIn({ context }, params: { user: AuthUser }) {
      context.refParent.send({
        type: "SIGN_IN",
        username: params.user.phoneNumber,
      });
    },
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
  context: ({ input }) => {
    return {
      refParent: input.parent,
      phoneNumber: "",
    };
  },
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
