import { Ctx, Query, Resolver } from "type-graphql";
import { Context } from "~/types/context";

@Resolver()
export class HelloResolver {
  @Query((_returns) => String)
  hello(@Ctx() { req }: Context) {
    console.log({ userId: req.session.userId });
    return "hello world";
  }
}
