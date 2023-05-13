import { Field, InputType, ObjectType } from "type-graphql";
import { IMutationResponse } from "./mutationResponse";
import { User } from "~/entities/user";
import { FieldError } from "./fieldError";

// define input type and response type for register function
@InputType()
export class RegisterInput {
  @Field()
  username: string;

  @Field()
  email: string;

  @Field()
  password: string;
}

// user for action needs response user
@ObjectType({ implements: IMutationResponse })
export class UserMutationResponse implements IMutationResponse {
  code: number;
  success: boolean;
  message?: string;

  @Field({ nullable: true })
  user?: User;

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}

// define input type and response type for login function
@InputType()
export class LoginInput {
  @Field()
  emailOrUsername: string;

  @Field()
  password: string;
}

@InputType()
export class ForgotPasswordInput {
  @Field()
  email: string;
}

@InputType()
export class ChangePasswordInput {
  @Field()
  newPassword: string;
}
