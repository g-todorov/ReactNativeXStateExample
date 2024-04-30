import { ActorRefFrom, setup, assign } from "xstate";
import { AuthenticatedParamList } from "../types/navigation";
import { HomeMachineActor, homeMachine } from "./home";
import { ListMachineActor, listMachine } from "./list";

export type AuthenticatedMachineActor = ActorRefFrom<
  typeof authenticatedMachine
>;

export const authenticatedMachine = setup({
  types: {
    context: {} as {
      refHome: HomeMachineActor | undefined;
      refList: ListMachineActor | undefined;
    },
    events: {} as { type: "NAVIGATE"; screen: keyof AuthenticatedParamList },
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
  },
  actors: { homeMachine, listMachine },
  guards: {
    isHomeScreen(_, params: { screen: keyof AuthenticatedParamList }) {
      return params.screen === "Home";
    },
    isListScreen(_, params: { screen: keyof AuthenticatedParamList }) {
      return params.screen === "List";
    },
  },
}).createMachine({
  context: { refHome: undefined, refList: undefined },
  id: "application",
  initial: "homeScreen",
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
  },
  states: {
    homeScreen: { entry: ["setRefHome"] },
    listScreen: { entry: ["setRefList"] },
  },
});
