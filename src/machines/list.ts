import {
  ActorRefFrom,
  assertEvent,
  assign,
  fromPromise,
  sendTo,
  setup,
} from "xstate";
import { addItem, deleteItem, getItems } from "../api";
import { getNotificationCenterEvent } from "./shared/utils";
import { Item } from "../types";

export type ListMachineActor = ActorRefFrom<typeof listMachine>;

export const listMachine = setup({
  types: {
    context: {} as { items: Item[] },
    events: {} as
      | { type: "DELETE_ITEM"; id: Item["id"] }
      | { type: "ADD_ITEM" }
      | { type: "GO_TO_ITEM"; id: Item["id"] },
  },
  actors: {
    getItems: fromPromise(async () => {
      const result = await getItems();

      return result;
    }),
    addItem: fromPromise(
      async ({ input }: { input: { title: Item["title"] } }) => {
        const result = await addItem(input.title);

        return result;
      },
    ),
    deleteItem: fromPromise(
      async ({ input }: { input: { id: Item["id"] } }) => {
        const result = await deleteItem(input.id);

        return result;
      },
    ),
  },
  actions: {
    sendToNotificationCenter: sendTo(({ system }) => {
      return system.get("notificationCenter");
    }, getNotificationCenterEvent),
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
    idle: {
      on: {
        DELETE_ITEM: {
          target: "deletingListItem",
        },
        ADD_ITEM: {
          target: "addingListItem",
        },
        GO_TO_ITEM: {
          actions: [
            {
              type: "sendToNotificationCenter",
              params: ({ event }) => {
                return {
                  notification: {
                    type: "modal",
                    title: "Under construction",
                    message: `The page for item with id "${event.id}" is not available at the moment.`,
                  },
                };
              },
            },
          ],
        },
      },
    },
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
    addingListItem: {
      invoke: {
        src: "addItem",
        input: ({ event }) => {
          assertEvent(event, "ADD_ITEM");
          return { title: "Title" };
        },
        onDone: {
          actions: [
            {
              type: "sendToNotificationCenter",
              params: ({ event }) => {
                return {
                  notification: {
                    type: "snackbar",
                    severity: "success",
                    message: `You've added an item with id ${event.output.item.id}.`,
                  },
                };
              },
            },
          ],
          target: "gettingListItems",
        },
      },
    },
    deletingListItem: {
      invoke: {
        src: "deleteItem",
        input: ({ event }) => {
          assertEvent(event, "DELETE_ITEM");
          return { id: event.id };
        },
        onDone: {
          actions: [
            {
              type: "sendToNotificationCenter",
              params: ({ event }) => {
                return {
                  notification: {
                    type: "snackbar",
                    severity: "error",
                    message: `You've deleted an item with id ${event.output.id}.`,
                  },
                };
              },
            },
          ],
          target: "gettingListItems",
        },
      },
    },
  },
});
