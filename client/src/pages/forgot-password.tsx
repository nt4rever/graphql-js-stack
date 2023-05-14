import Wrapper from "../components/Wrapper";
import { Form, Formik } from "formik";
import InputField from "../components/InputField";
import { Box, Button, Flex, Spinner } from "@chakra-ui/react";
import Link from "next/link";
import { useCheckAuth } from "../utils/useCheckAuth";
import {
  ForgotPasswordInput,
  useForgotPasswordMutation,
} from "../generated/graphql";

const ForgotPassword = () => {
  const initialValues: ForgotPasswordInput = { email: "" };
  const { data: authData, loading: authLoading } = useCheckAuth();
  const [forgotPassword, { data, loading }] = useForgotPasswordMutation();

  const handleSubmit = async (values: ForgotPasswordInput) => {
    await forgotPassword({
      variables: {
        forgotPasswordInput: values,
      },
    });
  };

  if (authLoading || (!authLoading && authData?.me))
    return (
      <Flex justifyContent="center" alignItems="center" minH="100vh">
        <Spinner />
      </Flex>
    );

  return (
    <Wrapper size="small">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ isSubmitting }) =>
          !loading && data ? (
            <Box>Please check your inbox</Box>
          ) : (
            <Form>
              <InputField
                name="email"
                placeholder="Email"
                label="Email"
                type="email"
              />

              <Flex mt={2}>
                <Link href="/login">Back to login</Link>
              </Flex>

              <Button
                type="submit"
                colorScheme="teal"
                mt={4}
                isLoading={isSubmitting}
              >
                Send Reset Password Email
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default ForgotPassword;
