import React from "react";
import { View } from "react-native";
import { Button, TextInput, HelperText } from "react-native-paper";
import { useForm } from "@swan-io/use-form";
import { isValidPhoneNumber } from "libphonenumber-js";

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
  const { Field, submitForm } = useForm({
    phoneNumber: {
      initialValue: phoneNumber,
      strategy: "onSubmit",
      validate: (value) => {
        if (!value) {
          return "Phone number is required.";
        }

        return isValidPhoneNumber(value)
          ? undefined
          : "Phone number is not valid.";
      },
    },
  });

  const handleSubmit = () => {
    submitForm({
      onSuccess: () => {
        onSignInPress();
      },
    });
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <Field name="phoneNumber">
        {({ value, onChange, error }) => (
          <View
            style={{
              marginBottom: 16,
              width: "100%",
            }}
          >
            <TextInput
              error={!!error}
              autoFocus={true}
              mode="outlined"
              label="Phone number"
              value={value}
              keyboardType="phone-pad"
              onChangeText={(value) => {
                onChange(value);
                setPhoneNumber(value);
              }}
            />
            {error && (
              <HelperText type="error" style={{ textAlign: "center" }}>
                {error}
              </HelperText>
            )}
          </View>
        )}
      </Field>
      <Button mode="contained" loading={isLoading} onPress={handleSubmit}>
        Sign In
      </Button>
    </View>
  );
});
