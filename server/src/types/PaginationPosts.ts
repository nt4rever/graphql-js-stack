import { Field, ObjectType } from "type-graphql";
import { Post } from "~/entities/post";

@ObjectType()
export class PaginationPosts {
  @Field()
  totalCount!: number;

  @Field((_type) => Date)
  cursor: Date;

  @Field()
  hasMore!: boolean;

  @Field((_type) => [Post])
  paginatedPosts!: Post[];
}
