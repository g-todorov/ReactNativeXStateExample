import React from "react";
import { Button, Text, View } from "react-native";
import { useSelector } from "@xstate/react";

import { AuthenticatedScreenProps } from "../types/navigation";
import { HomeMachineActor } from "../machines/home";
import { useApp } from "../contexts/useApp";

interface Props extends AuthenticatedScreenProps<"Home"> {
  actorRef?: HomeMachineActor;
}

export default React.memo(function Home({ navigation, actorRef }: Props) {
  const { state: appState } = useApp();
  const state = useSelector(actorRef, (snapshot) => snapshot);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Welcome, {appState.context.username}</Text>
      <Button
        title="List"
        onPress={() => {
          navigation.navigate("List");
        }}
      />
    </View>
  );
});
