import React from "react";
import { View } from "react-native";
import { List as PaperList, ActivityIndicator } from "react-native-paper";
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
    <View style={{ padding: 16 }}>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <PaperList.Section>
          {state?.context.items.map((item) => {
            return <PaperList.Item key={item.id} title={item.title} />;
          })}
        </PaperList.Section>
      )}
    </View>
  );
});
