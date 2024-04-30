import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export type RootStackParamList = {
  Authenticating: NavigatorScreenParams<AuthenticatingParamList> | undefined;
  Authenticated: NavigatorScreenParams<AuthenticatedParamList> | undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;

export type AuthenticatingParamList = {
  SignIn: undefined;
};

export type AuthenticatingScreenProps<
  Screen extends keyof AuthenticatingParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<AuthenticatingParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;

export type AuthenticatedParamList = {
  Home: undefined;
  List: undefined;
};

export type AuthenticatedScreenProps<
  Screen extends keyof AuthenticatedParamList,
> = CompositeScreenProps<
  NativeStackScreenProps<AuthenticatedParamList, Screen>,
  NativeStackScreenProps<RootStackParamList>
>;
