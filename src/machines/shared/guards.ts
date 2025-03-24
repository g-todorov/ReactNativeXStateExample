import { EventObject } from "xstate";
import { GuardArgs } from "xstate/guards";

import {
  AuthenticatedParamList,
  AuthenticatingParamList,
  OnboardingParamList,
} from "../../types/navigation";

export type Screen =
  | keyof AuthenticatingParamList
  | keyof OnboardingParamList
  | keyof AuthenticatedParamList;

export function isNavigatedScreen(
  _: GuardArgs<{}, EventObject>,
  params: {
    navigatedScreen: Screen;
    screen: Screen;
  },
) {
  return params.navigatedScreen === params.screen;
}
