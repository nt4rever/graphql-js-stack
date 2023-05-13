require("dotenv").config();
import { DataSource } from "typeorm";
import { Post } from "./entities/post";
import { User } from "./entities/user";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  logging: false,
  synchronize: true,
  entities: [User, Post],
});
