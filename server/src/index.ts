require("dotenv").config();
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import bodyParser from "body-parser";
import MongoStore from "connect-mongo";
import cors from "cors";
import express from "express";
import session from "express-session";
import mongoose from "mongoose";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { AppDataSource } from "./data-source";
import { Context } from "./types/context";
import { COOKIE_NAME, ___prod__ } from "./utils/constants";
import { HelloResolver, UserResolver, PostResolver } from "./resolvers";

const PORT = process.env.PORT || 4000;

const main = async () => {
  await AppDataSource.initialize();

  const app = express();

  const mongoUrl = process.env.MONGO_DB_URL as string;
  await mongoose.connect(mongoUrl);

  app.use(
    session({
      name: COOKIE_NAME,
      secret: process.env.SESSION_SECRET as string,
      store: MongoStore.create({ mongoUrl }),
      cookie: {
        maxAge: 1000 * 60 * 60,
        httpOnly: true, //JS front end cannot access the cookie
        secure: ___prod__, // cookie only works in https
        sameSite: "lax",
      },
      saveUninitialized: false, // don't save empty sessions, right from the start
      resave: false,
    })
  );

  const apolloServer = new ApolloServer<Context>({
    schema: await buildSchema({
      resolvers: [HelloResolver, UserResolver, PostResolver],
      validate: false,
    }),
  });

  await apolloServer.start();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    }),
    bodyParser.json(),
    expressMiddleware(apolloServer, {
      context: async ({ req, res }) => ({ req, res }),
    })
  );

  app.listen(PORT, () =>
    console.log(
      `Server started on port ${PORT}. Graphql started on http://localhost:${PORT}/graphql`
    )
  );
};

main().catch((err) => console.log(err));
