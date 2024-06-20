import { ActorRefFrom, setup, sendParent, fromPromise, stop } from "xstate";

import { AuthenticatingParamList } from "../types/navigation";
import { signIn } from "../api";

export type AuthenticatingMachineActor = ActorRefFrom<
  typeof authenticatingMachine
>;

export const authenticatingMachine = setup({
  types: {
    events: {} as
      | { type: "SIGN_IN" }
      | { type: "NAVIGATE"; screen: keyof AuthenticatingParamList }
      | { type: "STOP" },
  },
  actors: {
    signIn: fromPromise(async () => {
      const result = await signIn();
      return result as { status: string; user: { name: string } };
    }),
  },
  actions: {
    sendParentSignIn: sendParent(
      (_, { user: { name } }: { user: { name: string } }) => {
        return {
          type: "SIGN_IN",
          username: name,
        };
      },
    ),
  },
}).createMachine({
  id: "authenticating",
  initial: "idle",
  states: {
    idle: {
      on: {
        SIGN_IN: {
          target: "signingIn",
        },
      },
    },
    signingIn: {
      invoke: {
        src: "signIn",
        onDone: {
          actions: [
            {
              type: "sendParentSignIn",
              params: ({ event }) => {
                return event.output;
              },
            },
          ],
        },
      },
    },
  },
});
