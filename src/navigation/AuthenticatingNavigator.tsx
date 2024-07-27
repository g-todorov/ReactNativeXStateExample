import * as React from "react";
import { useSelector } from "@xstate/react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import {
  AuthenticatingParamList,
  RootStackScreenProps,
} from "../types/navigation";
import { AuthenticatingMachineActor } from "../machines/authenticating.navigator";
import SignInScreen from "../screens/SignIn";

const Stack = createNativeStackNavigator<AuthenticatingParamList>();

interface Props extends RootStackScreenProps<"Authenticating"> {
  actorRef: AuthenticatingMachineActor;
}

export function AuthenticatingNavigator({ navigation, actorRef }: Props) {
  const state = useSelector(actorRef, (snapshot) => {
    return snapshot;
  });

  return (
    <Stack.Navigator initialRouteName="SignIn">
      <Stack.Screen name="SignIn" options={{ title: "Sing In" }}>
        {(props) => {
          return (
            <SignInScreen
              onSignInPress={() => {
                actorRef.send({ type: "SIGN_IN" });
              }}
              isLoading={state.matches("signingIn")}
              {...props}
            />
          );
        }}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
