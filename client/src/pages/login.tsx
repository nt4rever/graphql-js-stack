import React from "react";
import Wrapper from "../components/Wrapper";
import { Form, Formik, FormikHelpers } from "formik";
import InputField from "../components/InputField";
import { Box, Button, Flex, Spinner, useToast } from "@chakra-ui/react";
import { mapFieldErrors } from "../utils/mapFieldErrors";
import { useRouter } from "next/router";
import {
  LoginInput,
  MeDocument,
  MeQuery,
  useLoginMutation,
} from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";
import Link from "next/link";

const LoginPage = () => {
  const initialValues: LoginInput = {
    emailOrUsername: "",
    password: "",
  };
  const router = useRouter();
  const toast = useToast();

  const { data: meData, loading: authLoading } = useCheckAuth();
  const [loginUser, { loading, data, error }] = useLoginMutation();

  const handleSubmit = async (
    values: LoginInput,
    { setErrors }: FormikHelpers<LoginInput>
  ) => {
    const response = await loginUser({
      variables: {
        loginInput: values,
      },
      update(cache, { data }) {
        if (data?.login.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: data.login.user,
            },
          });
        }
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

  if (authLoading || (meData?.me && !authLoading))
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner />
      </Flex>
    );

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
            <Box mt={2}>
              <Link href={"/forgot-password"}>Forgot password</Link>
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
