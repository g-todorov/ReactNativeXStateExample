import { ActorRefFrom, setup } from "xstate";

export type HomeMachineActor = ActorRefFrom<typeof homeMachine>;

export const homeMachine = setup({
  types: {},
  actors: {},
}).createMachine({
  id: "home",
  initial: "idle",
  states: {
    idle: {},
  },
});
