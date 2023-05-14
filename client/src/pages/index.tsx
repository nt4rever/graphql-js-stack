import { Box, Flex, Heading, Spinner, Stack, Text } from "@chakra-ui/react";
import { Container } from "../components/Container";
import Navbar from "../components/Navbar";
import {
  PostsDocument,
  PostsQuery,
  PostsQueryVariables,
  usePostsQuery,
} from "../generated/graphql";
import { addApolloState, initializeApollo } from "../libs/apolloClient";
import Link from "next/link";
import Wrapper from "../components/Wrapper";
import PostEditDeleteButton from "../components/PostEditDeleteButton";

const limit = 3;

const Index = () => {
  const { data, loading } = usePostsQuery({
    variables: {
      limit,
    },
    notifyOnNetworkStatusChange: true,
  });

  return (
    <Container height="100vh" alignContent="center">
      <Navbar />
      {loading && <Spinner />}
      <Wrapper>
        <Stack spacing={8}>
          {data?.posts?.paginatedPosts.map((post, _) => (
            <Flex key={post.id} p={5} shadow="md" borderWidth="1px">
              <Box flex={1}>
                <Link href={`/post/${post.id}`}>
                  <Heading fontSize="xl">{post.title}</Heading>
                </Link>
                <Text>posted by {post.user.username}</Text>
                <Flex align="center" justifyContent={"space-between"}>
                  <Text mt={4}>{post.textSnippet}...</Text>
                  <PostEditDeleteButton
                    postId={post.id}
                    postUserId={post.user.id}
                  />
                </Flex>
              </Box>
            </Flex>
          ))}
        </Stack>
      </Wrapper>
    </Container>
  );
};

export async function getServerSideProps() {
  const apolloClient = initializeApollo();

  await apolloClient.query<PostsQuery, PostsQueryVariables>({
    query: PostsDocument,
    variables: {
      limit,
    },
  });

  return addApolloState(apolloClient, {
    props: {},
  });
}

export default Index;
