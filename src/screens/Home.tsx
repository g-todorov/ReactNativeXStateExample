import React from "react";
import { View } from "react-native";
import { Button, Card, Icon, Text } from "react-native-paper";
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
    <View style={{ padding: 16 }}>
      <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
        Welcome, {appState.context.username}
      </Text>
      <Card>
        <Card.Title title="You can store your items here."></Card.Title>
        <Card.Actions>
          <Button
            contentStyle={{ flexDirection: "row-reverse" }}
            onPress={() => {
              navigation.navigate("List");
            }}
            icon={({ ...props }) => {
              return <Icon source="arrow-right" {...props} />;
            }}
          >
            Explore
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
});
