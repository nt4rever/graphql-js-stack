import {
  Alert,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import { Form, Formik, FormikHelpers } from "formik";
import Link from "next/link";
import router, { useRouter } from "next/router";
import { useState } from "react";
import InputField from "../components/InputField";
import Wrapper from "../components/Wrapper";
import {
  ChangePasswordInput,
  MeDocument,
  MeQuery,
  useChangePasswordMutation,
} from "../generated/graphql";
import { mapFieldErrors } from "../utils/mapFieldErrors";
import { useCheckAuth } from "../utils/useCheckAuth";

const ChangePassword = () => {
  const { data: authData, loading: authLoading } = useCheckAuth();
  const { query } = useRouter();
  const initialValues = { newPassword: "" };
  const [tokenError, setTokenError] = useState("");
  const [changePassword] = useChangePasswordMutation();

  const handleSubmit = async (
    values: ChangePasswordInput,
    { setErrors }: FormikHelpers<ChangePasswordInput>
  ) => {
    if (query.userId && query.token) {
      const response = await changePassword({
        variables: {
          changePasswordInput: values,
          token: query.token as string,
          userId: query.userId as string,
        },
        update(cache, { data }) {
          if (data?.changePassword.success) {
            cache.writeQuery<MeQuery>({
              query: MeDocument,
              data: {
                me: data.changePassword.user,
              },
            });
          }
        },
      });

      if (response.data?.changePassword.errors) {
        const fieldErrors = mapFieldErrors(response.data.changePassword.errors);
        if ("token" in fieldErrors) setTokenError(fieldErrors.token);
        setErrors(fieldErrors);
      } else if (response.data?.changePassword.user) {
        router.push("/");
      }
    }
  };

  if (authLoading || (!authLoading && authData?.me))
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner />
      </Flex>
    );

  if (!query.token || !query.userId)
    return (
      <Wrapper size="small">
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Invalid password change request</AlertTitle>
        </Alert>
        <Flex mt={2}>
          <Link href="/login">Back to Login</Link>
        </Flex>
      </Wrapper>
    );

  return (
    <Wrapper size="small">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              placeholder="New password"
              label="New password"
              type="password"
            />

            {tokenError && (
              <Flex>
                <Box color="red" mr={2}>
                  {tokenError}
                </Box>
                <Link href="/forgot-password">Go back to Forgot Password</Link>
              </Flex>
            )}
            <Button
              type="submit"
              colorScheme="teal"
              mt={4}
              isLoading={isSubmitting}
            >
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default ChangePassword;
