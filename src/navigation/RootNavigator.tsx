import * as React from "react";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { RootStackParamList } from "../types/navigation";
import { useApp } from "../contexts/useApp";
import { AuthenticatingNavigator } from "./AuthenticatingNavigator";
import { AuthenticatedNavigator } from "./AuthenticatedNavigator";
import { OnboardingNavigator } from "./OnboardingNavigator";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { state } = useApp();

  const isAuthenticating = state.matches("authenticating");
  const isAuthenticated = state.matches("authenticated");
  const isOnboarding = state.matches("onboarding");

  if (
    state.matches("initializing") ||
    state.matches("signingOut") ||
    state.matches("gettingUser")
  ) {
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
      {isOnboarding && (
        <Stack.Screen name="Onboarding">
          {(props) => {
            return state.context.refOnboarding ? (
              <OnboardingNavigator
                actorRef={state.context.refOnboarding}
                {...props}
              />
            ) : null;
          }}
        </Stack.Screen>
      )}
    </Stack.Navigator>
  );
}
