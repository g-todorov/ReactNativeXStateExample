import * as React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import { useApp } from "../contexts/useApp";
import { AuthenticatingNavigator } from "./AuthenticatingNavigator";
import { AuthenticatedNavigator } from "./AuthenticatedNavigator";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { state } = useApp();

  const isAuthenticating = state.matches("authenticating");
  const isAuthenticated = state.matches("authenticated");

  if (state.matches("initializing") || state.matches("signingOut")) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size={"large"} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticating && (
        <Stack.Screen name="Authenticating">
          {(props) => {
            return state.context.refAuthenticating ? (
              <AuthenticatingNavigator
                actorRef={state.context.refAuthenticating}
                {...props}
              />
            ) : null;
          }}
        </Stack.Screen>
      )}
      {isAuthenticated && (
        <Stack.Screen name="Authenticated">
          {(props) => {
            return state.context.refAuthenticated ? (
              <AuthenticatedNavigator
                actorRef={state.context.refAuthenticated}
                {...props}
              />
            ) : null;
          }}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
