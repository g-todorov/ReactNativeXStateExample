import React from "react";
import { View } from "react-native";
import { Button, TextInput } from "react-native-paper";

import { AuthenticatingScreenProps } from "../types/navigation";

interface Props extends AuthenticatingScreenProps<"SignIn"> {
  phoneNumber: string;
  isLoading: boolean;
  onSignInPress(): void;
  setPhoneNumber(phoneNumber: string): void;
}

export default React.memo(function SignIn({
  onSignInPress,
  isLoading,
  phoneNumber,
  setPhoneNumber,
}: Props) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <TextInput
        mode="outlined"
        label="Phone number"
        value={phoneNumber}
        keyboardType="phone-pad"
        onChangeText={(value) => {
          setPhoneNumber(value);
        }}
        style={{ marginBottom: 16, width: "100%" }}
      />
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
