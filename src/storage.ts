import { MMKV } from "react-native-mmkv";

export const AUTH_STORAGE_KEY = "auth";

export const CURRENT_USER_ID_KEY = "currentUserId";

export const ONBOARDING_USERS_STORAGE_KEY = "onboardingUsers";

export const USERS_STORAGE_KEY = "users";

export const storage = new MMKV();
