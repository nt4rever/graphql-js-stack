import React from "react";
import Wrapper from "../components/Wrapper";
import { Form, Formik, FormikHelpers } from "formik";
import InputField from "../components/InputField";
import { Box, Button, useToast } from "@chakra-ui/react";
import { mapFieldErrors } from "../utils/mapFieldErrors";
import { useRouter } from "next/router";
import { LoginInput, useLoginMutation } from "../generated/graphql";

const LoginPage = () => {
  const initialValues: LoginInput = {
    emailOrUsername: "",
    password: "",
  };
  const router = useRouter();
  const toast = useToast();
  const [loginUser, { loading, data, error }] = useLoginMutation();

  const handleSubmit = async (
    values: LoginInput,
    { setErrors }: FormikHelpers<LoginInput>
  ) => {
    const response = await loginUser({
      variables: {
        loginInput: values,
      },
    });

    if (response.data?.login.errors) {
      setErrors(mapFieldErrors(response.data.login.errors));
    } else if (response.data?.login.user) {
      // login successfully
      toast({
        title: "Welcome",
        description: `${response.data.login.user.username}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/");
    }
  };

  return (
    <Wrapper size="small">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              label="Email Or Username"
              name="emailOrUsername"
              placeholder="Email Or Username"
              type="text"
            />
            <Box mt={4}>
              <InputField
                name="password"
                placeholder="Password"
                label="Password"
                type="password"
              />
            </Box>
            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Sign in
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default LoginPage;
