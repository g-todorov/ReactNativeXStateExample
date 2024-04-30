import React from "react";
import { Button, View } from "react-native";
import { AuthenticatingScreenProps } from "../types/navigation";

interface Props extends AuthenticatingScreenProps<"SignIn"> {
  isLoading: boolean;
  onSignInPress(): void;
}

export default React.memo(function SignIn({ onSignInPress, isLoading }: Props) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button
        title={isLoading ? "Loading" : "Sign In"}
        onPress={() => {
          onSignInPress();
        }}
      />
    </View>
  );
});
