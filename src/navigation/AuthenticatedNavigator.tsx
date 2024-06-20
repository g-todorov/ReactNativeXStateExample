import * as React from "react";
import { useSelector } from "@xstate/react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  AuthenticatedParamList,
  RootStackScreenProps,
} from "../types/navigation";
import { AuthenticatedMachineActor } from "../machines/authenticated.navigator";
import HomeScreen from "../screens/Home";
import ListScreen from "../screens/List";

const Stack = createNativeStackNavigator<AuthenticatedParamList>();

interface Props extends RootStackScreenProps<"Authenticated"> {
  actorRef: AuthenticatedMachineActor;
}

export function AuthenticatedNavigator({ actorRef }: Props) {
  const state = useSelector(actorRef, (snapshot) => {
    return snapshot;
  });

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home">
        {(props) => {
          return <HomeScreen actorRef={state.context.refHome} {...props} />;
        }}
      </Stack.Screen>
      <Stack.Screen name="List">
        {(props) => {
          return <ListScreen actorRef={state.context.refList} {...props} />;
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
