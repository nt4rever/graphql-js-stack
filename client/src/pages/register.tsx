import { Box, Button, Flex, Spinner, Text, useToast } from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/router";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";

import { mapFieldErrors } from "../utils/mapFieldErrors";
import {
  MeDocument,
  MeQuery,
  RegisterInput,
  useRegisterMutation,
} from "../generated/graphql";
import { useCheckAuth } from "../utils/useCheckAuth";

const RegisterPage = () => {
  const initialValues: RegisterInput = {
    username: "",
    email: "",
    password: "",
  };

  const router = useRouter();
  const toast = useToast();
  const { data: meData, loading: authLoading } = useCheckAuth();

  const [registerUser, { loading, data, error }] = useRegisterMutation();

  const onRegisterSubmit = async (
    values: RegisterInput,
    { setErrors }: FormikHelpers<RegisterInput>
  ) => {
    const response = await registerUser({
      variables: {
        registerInput: values,
      },
      update(cache, { data }) {
        if (data.register.success) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: {
              me: data.register.user,
            },
          });
        }
      },
    });

    if (response.data?.register.errors) {
      setErrors(mapFieldErrors(response.data.register.errors));
    } else if (response.data?.register.user) {
      // register successfully
      toast({
        title: "Welcome",
        description: `${response.data.register.user.username}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      router.push("/");
    }
  };

  if (authLoading || (meData.me && !authLoading))
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner />
      </Flex>
    );

  return (
    <Wrapper size="small">
      {error && <Text>Failed to register</Text>}
      {data && !data.register.success && <Text>{data.register.message}</Text>}
      <Formik initialValues={initialValues} onSubmit={onRegisterSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              label="Username"
              name="username"
              placeholder="Username"
              type="text"
            />
            <Box mt={4}>
              <InputField
                name="email"
                placeholder="Email"
                label="Email"
                type="email"
              />
            </Box>
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
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default RegisterPage;
