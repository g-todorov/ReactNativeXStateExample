import React from "react";
import { View } from "react-native";
import { Button } from "react-native-paper";

import { AuthenticatingScreenProps } from "../types/navigation";

interface Props extends AuthenticatingScreenProps<"SignIn"> {
  isLoading: boolean;
  onSignInPress(): void;
}

export default React.memo(function SignIn({ onSignInPress, isLoading }: Props) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Button
        mode="contained"
        loading={isLoading}
        onPress={() => {
          onSignInPress();
        }}
      >
        Sign In
      </Button>
    </View>
  );
});
