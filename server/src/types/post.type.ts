import { Field, ID, InputType, ObjectType } from "type-graphql";
import { Post } from "~/entities/post";
import { FieldError } from "./fieldError";
import { IMutationResponse } from "./mutationResponse";

@InputType()
export class CreatePostInput {
  @Field()
  title: string;

  @Field()
  text: string;
}

@InputType()
export class UpdatePostInput {
  @Field((_type) => ID)
  id: number;

  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  text?: string;
}

@ObjectType({ implements: IMutationResponse })
export class PostMutationResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string | undefined;

  @Field({ nullable: true })
  post?: Post;

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
