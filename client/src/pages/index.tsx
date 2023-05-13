import { Spinner } from "@chakra-ui/react";
import { Container } from "../components/Container";
import Navbar from "../components/Navbar";
import { PostsDocument, usePostsQuery } from "../generated/graphql";
import { addApolloState, initializeApollo } from "../libs/apolloClient";

const Index = () => {
  const { data, loading } = usePostsQuery();
  return (
    <Container height="100vh" alignContent="center">
      <Navbar />
      {loading && <Spinner />}
      <div>
        {data?.posts.map((post, index) => (
          <div key={index}>{post.title}</div>
        ))}
      </div>
    </Container>
  );
};

export async function getServerSideProps() {
  const apolloClient = initializeApollo();

  await apolloClient.query({
    query: PostsDocument,
  });

  return addApolloState(apolloClient, {
    props: {},
  });
}

export default Index;
