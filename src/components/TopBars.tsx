import { Appbar } from "react-native-paper";
import { NativeStackHeaderProps } from "@react-navigation/native-stack";

interface AppBarProps extends NativeStackHeaderProps {
  onLogoutPress(): void;
}

export function AppBar({
  back,
  navigation,
  route,
  onLogoutPress,
}: AppBarProps) {
  return (
    <Appbar.Header>
      {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      <Appbar.Content title={route.name} />
      <Appbar.Action
        icon="logout"
        onPress={() => {
          onLogoutPress();
        }}
      />
    </Appbar.Header>
  );
}

interface OnboardingBarProps extends NativeStackHeaderProps {
  onLogoutPress(): void;
  onGoBackPress(): void;
}

export function OnboardingBar({
  route,
  onLogoutPress,
  onGoBackPress,
}: OnboardingBarProps) {
  return (
    <Appbar.Header>
      {route.name !== "StepOne" ? (
        <Appbar.BackAction onPress={onGoBackPress} />
      ) : null}
      <Appbar.Content title={"Onboarding"} />
      <Appbar.Action
        icon="logout"
        onPress={() => {
          onLogoutPress();
        }}
      />
    </Appbar.Header>
  );
}
