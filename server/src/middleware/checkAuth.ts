import { GraphQLError } from "graphql";
import { MiddlewareFn } from "type-graphql";
import { Context } from "~/types/context";

export const checkAuth: MiddlewareFn<Context> = (
  { context: { req } },
  next
) => {
  if (!req.session.userId)
    throw new GraphQLError("You are not authorized to perform this action.", {
      extensions: {
        code: "FORBIDDEN",
        http: {
          status: 401,
        },
      },
    });
  return next();
};
