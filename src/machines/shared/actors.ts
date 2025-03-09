import { fromCallback } from "xstate";

import {
  getCurrentRouteName,
  navigationRef,
} from "../../navigation/NavigationRef";

export const navigationSubscriber = fromCallback(({ sendBack }) => {
  const unsubscribe = navigationRef.addListener("state", (_event) => {
    const screenRoute = getCurrentRouteName();

    if (screenRoute) {
      sendBack({ type: "NAVIGATE", screen: screenRoute });
    }
  });

  return unsubscribe;
});
