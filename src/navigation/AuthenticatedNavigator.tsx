import * as React from "react";
import { Appbar } from "react-native-paper";
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
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        header: (props) => {
          return (
            <Appbar.Header>
              {props.back ? (
                <Appbar.BackAction onPress={props.navigation.goBack} />
              ) : null}
              <Appbar.Content title={props.route.name} />
              <Appbar.Action
                icon="logout"
                onPress={() => {
                  actorRef.send({ type: "SIGN_OUT" });
                }}
              />
            </Appbar.Header>
          );
        },
      }}
    >
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
