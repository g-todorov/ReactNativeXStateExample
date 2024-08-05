import React from "react";
import { TouchableOpacity, View } from "react-native";
import {
  List as PaperList,
  ActivityIndicator,
  Icon,
  FAB,
  Text,
} from "react-native-paper";
import { useSelector } from "@xstate/react";

import { AuthenticatedScreenProps } from "../types/navigation";
import { ListMachineActor } from "../machines/list";

interface Props extends AuthenticatedScreenProps<"List"> {
  actorRef?: ListMachineActor;
}

export default React.memo(function List({ actorRef }: Props) {
  const state = useSelector(actorRef, (snapshot) => snapshot);

  const isLoading = state?.matches("gettingListItems");
  const isListEmpty = state?.context.items.length === 0;

  return (
    <View style={{ padding: 16, flex: 1 }}>
      {isLoading ? (
        <ActivityIndicator />
      ) : isListEmpty ? (
        <Text variant="bodyLarge">No items to display</Text>
      ) : (
        <PaperList.Section>
          {state?.context.items.map((item) => {
            return (
              <PaperList.Item
                onPress={({}) => {
                  return actorRef?.send({ type: "GO_TO_ITEM", id: item.id });
                }}
                key={item.id as string}
                title={item.title}
                description={item.id}
                right={({ ...props }) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        actorRef?.send({ type: "DELETE_ITEM", id: item.id });
                      }}
                    >
                      <Icon source="delete-outline" size={22} {...props} />
                    </TouchableOpacity>
                  );
                }}
              />
            );
          })}
        </PaperList.Section>
      )}
      <FAB
        icon="plus"
        style={{ position: "absolute", bottom: 16, right: 16 }}
        onPress={() => {
          actorRef?.send({ type: "ADD_ITEM" });
        }}
      />
    </View>
  );
});
