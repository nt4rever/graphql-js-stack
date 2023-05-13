import { Box, Button, Flex, Heading, useToast } from "@chakra-ui/react";
import Link from "next/link";
import {
  MeDocument,
  MeQuery,
  useLogoutMutation,
  useMeQuery,
} from "../generated/graphql";

const Navbar = () => {
  const [logout, { loading: useLogoutMutationLoading }] = useLogoutMutation();
  const { data, loading: useMeQueryLoading } = useMeQuery();

  const toast = useToast();
  const handleLogout = async () => {
    await logout({
      update(cache, { data }) {
        if (data?.logout) {
          cache.writeQuery<MeQuery>({
            query: MeDocument,
            data: { me: null },
          });
        }
      },
    });
    toast({
      title: "Welcome",
      description: `Logout successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  let body: React.ReactNode;

  if (useMeQueryLoading) {
    body = null;
  } else if (!data?.me) {
    body = (
      <>
        <Link href="/login">
          <Button mr={2}>Login</Button>
        </Link>
        <Link href="/register">
          <Button>Register</Button>
        </Link>
      </>
    );
  } else {
    body = (
      <Flex>
        <Link href="/create-post">
          <Button mr={4}>Create Post</Button>
        </Link>
        <Button onClick={handleLogout} isLoading={useLogoutMutationLoading}>
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Box p={4} mx={16}>
      <Flex justifyContent={"space-between"} alignItems={"center"}>
        <Link href={"/"}>
          <Heading>Reddit</Heading>
        </Link>
        <Box>{body}</Box>
      </Flex>
    </Box>
  );
};

export default Navbar;
