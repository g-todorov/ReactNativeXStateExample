import { useEffect, useRef } from "react";
import {
  getCurrentRouteBreadcrumb,
  getCurrentRouteName,
  navigationRef,
} from "../navigation/NavigationRef";

export function useNavigator<T>(
  callback: (route: keyof T) => void,
  initialRoute?: keyof T,
) {
  const prevRoute = useRef<string | undefined>();

  useEffect(() => {
    const unsubscribe = navigationRef.addListener("state", (_event) => {
      const screenRoute = getCurrentRouteName();

      if (screenRoute && prevRoute.current !== screenRoute) {
        prevRoute.current = screenRoute;
        callback(screenRoute as keyof T);
      } else if (!screenRoute && initialRoute) {
        callback(initialRoute);
      }
    });

    return unsubscribe;
  }, []);
}
