import React from "react";
import { Text, View } from "react-native";
import { useSelector } from "@xstate/react";

import { AuthenticatedScreenProps } from "../types/navigation";
import { ListMachineActor } from "../machines/list";

interface Props extends AuthenticatedScreenProps<"List"> {
  actorRef?: ListMachineActor;
}

export default React.memo(function List({ actorRef }: Props) {
  const state = useSelector(actorRef, (snapshot) => snapshot);

  const isLoading = state?.matches("gettingListItems");

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : (
        state?.context.items.map((item) => {
          return <Text key={item.id}>{item.title}</Text>;
        })
      )}
    </View>
  );
});
