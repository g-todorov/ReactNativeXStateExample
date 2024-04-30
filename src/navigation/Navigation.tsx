import { NavigationContainer } from "@react-navigation/native";
import { useApp } from "../contexts/useApp";
import { RootNavigator } from "./RootNavigator";
import { navigationRef } from "./NavigationRef";

export function Navigation() {
  const { send } = useApp();

  return (
    <NavigationContainer
      onReady={() => {
        send({ type: "START_APP" });
      }}
      ref={navigationRef}
    >
      <RootNavigator />
    </NavigationContainer>
  );
}
