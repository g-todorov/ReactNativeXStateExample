import { NavigationContainer } from "@react-navigation/native";
import { useApp } from "../contexts/useApp";
import { RootNavigator } from "./RootNavigator";
import { navigationRef } from "./NavigationRef";
import { NotificationModal } from "../components/NotificationModal";
import { NotificationSnackbar } from "../components/NotificationSnackbar";

export function Navigation() {
  const { send, state } = useApp();

  return (
    <NavigationContainer
      onReady={() => {
        send({ type: "START_APP" });
      }}
      ref={navigationRef}
    >
      <RootNavigator />
      {state.context.refNotificationCenter && (
        <>
          <NotificationSnackbar actor={state.context.refNotificationCenter} />
          <NotificationModal actor={state.context.refNotificationCenter} />
        </>
      )}
    </NavigationContainer>
  );
}
