require("dotenv").config();
import "reflect-metadata";
import express from "express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import bodyParser from "body-parser";
import { AppDataSource } from "./data-source";
import { UserResolver } from "./resolvers/user";

const PORT = process.env.PORT || 4000;

const main = async () => {
  await AppDataSource.initialize();

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver],
      validate: false,
    }),
  });

  await apolloServer.start();

  app.use(cors(), bodyParser.json(), expressMiddleware(apolloServer));

  app.listen(PORT, () =>
    console.log(
      `Server started on port ${PORT}. Graphql started on http://localhost:${PORT}/grapql`
    )
  );
};

main().catch((err) => console.log(err));
