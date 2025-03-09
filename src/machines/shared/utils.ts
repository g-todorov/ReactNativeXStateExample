import { Notification } from "../notificationCenter";
import { ONBOARDING_USERS_STORAGE_KEY, storage } from "../../storage";
import { OnboardingParamList } from "../../types/navigation";
import { Context as StepOneContext } from "../onboardingStepOne";
import { Context as StepTwoContext } from "../onboardingStepTwo";
import { Context as StepThreeContext } from "../onboardingStepThree";

export function getNotificationCenterEvent(
  {},
  params: { notification: Notification },
) {
  return {
    type: "NOTIFY",
    notification: params.notification,
  };
}

export interface PersistedOnboardingState {
  currentStep: keyof OnboardingParamList;
  stepOne?: StepOneContext;
  stepTwo?: StepTwoContext;
  stepThree?: StepThreeContext;
}

export function persistOnboardingState({
  currentStep,
  key,
  data,
}: {
  currentStep: PersistedOnboardingState["currentStep"];
  key?: keyof Omit<PersistedOnboardingState, "currentStep">;
  data?: PersistedOnboardingState["stepOne" | "stepTwo" | "stepThree"];
}) {
  const persistedData: PersistedOnboardingState | undefined =
    JSON.parse(storage.getString(ONBOARDING_USERS_STORAGE_KEY) ?? "null") ??
    undefined;

  storage.set(
    ONBOARDING_USERS_STORAGE_KEY,
    JSON.stringify({
      ...persistedData,
      currentStep,
      ...(key && data && { [key]: { ...data } }),
    }),
  );
}

export function getOnboardingState(): PersistedOnboardingState | undefined {
  return (
    JSON.parse(storage.getString(ONBOARDING_USERS_STORAGE_KEY) ?? "null") ??
    undefined
  );
}

export function deleteOnboardingState() {
  storage.delete(ONBOARDING_USERS_STORAGE_KEY);
}
