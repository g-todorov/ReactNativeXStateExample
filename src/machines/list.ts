import { ActorRefFrom, assign, fromPromise, setup } from "xstate";
import { getItems } from "../api";

export type ListMachineActor = ActorRefFrom<typeof listMachine>;

interface Item {
  title: string;
  id: number;
}

export const listMachine = setup({
  types: { context: {} as { items: Item[] } },
  actors: {
    getItems: fromPromise(async () => {
      const result = await getItems();
      return result as { items: Item[]; status: string };
    }),
  },
  actions: {
    setItems: assign({
      items: (_, { items }: { items: Item[] }) => {
        return items;
      },
    }),
  },
}).createMachine({
  id: "list",
  initial: "gettingListItems",
  context: { items: [] },
  states: {
    idle: {},
    gettingListItems: {
      invoke: {
        src: "getItems",
        onDone: {
          target: "idle",
          actions: [
            {
              type: "setItems",
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
