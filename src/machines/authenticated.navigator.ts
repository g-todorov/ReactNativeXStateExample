import { ActorRefFrom, setup, assign, ActorRef, Snapshot } from "xstate";

import { AuthenticatedParamList } from "../types/navigation";
import { HomeMachineActor, homeMachine } from "./home";
import { ListMachineActor, listMachine } from "./list";
import { navigationSubscriber } from "./shared/actors";
import { Events as ParentEvents } from "../contexts/useApp";

type ParentActor = ActorRef<Snapshot<unknown>, ParentEvents>;

export type AuthenticatedMachineActor = ActorRefFrom<
  typeof authenticatedMachine
>;

export const authenticatedMachine = setup({
  types: {
    input: {} as { parent: ParentActor },
    context: {} as {
      refParent: ParentActor;
      refHome: HomeMachineActor | undefined;
      refList: ListMachineActor | undefined;
    },
    events: {} as
      | {
          type: "NAVIGATE";
          screen: keyof AuthenticatedParamList;
        }
      | { type: "SIGN_OUT" },
  },
  actors: {
    homeMachine,
    listMachine,
    navigationSubscriber,
  },
  actions: {
    setRefHome: assign({
      refHome: ({ spawn }) => {
        return spawn("homeMachine");
      },
    }),
    setRefList: assign({
      refList: ({ spawn }) => {
        return spawn("listMachine");
      },
    }),
    sendParentSignOut({ context }) {
      context.refParent.send({ type: "SIGN_OUT" });
    },
  },
  guards: {
    isHomeScreen(_, params: { screen: keyof AuthenticatedParamList }) {
      return params.screen === "Home";
    },
    isListScreen(_, params: { screen: keyof AuthenticatedParamList }) {
      return params.screen === "List";
    },
  },
}).createMachine({
  context: ({ input }) => {
    return { refParent: input.parent, refHome: undefined, refList: undefined };
  },
  id: "authenticatedNavigator",
  initial: "homeScreen",
  invoke: { src: "navigationSubscriber" },
  on: {
    NAVIGATE: [
      {
        guard: {
          type: "isHomeScreen",
          params: ({ event }) => {
            return {
              screen: event.screen,
            };
          },
        },
        target: ".homeScreen",
      },
      {
        guard: {
          type: "isListScreen",
          params: ({ event }) => {
            return {
              screen: event.screen,
            };
          },
        },
        target: ".listScreen",
      },
    ],
    SIGN_OUT: { actions: ["sendParentSignOut"] },
  },
  states: {
    homeScreen: { entry: ["setRefHome"] },
    listScreen: { entry: ["setRefList"] },
  },
});
