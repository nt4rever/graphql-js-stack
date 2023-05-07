import { Arg, Mutation, Resolver } from "type-graphql";
import { User } from "~/entities/user";
import {
  LoginInput,
  RegisterInput,
  UserMutationResponse,
} from "~/types/user.type";
import * as argon from "argon2";
import { validateRegisterInput } from "~/utils/user.validate";

@Resolver()
export class UserResolver {
  @Mutation((_returns) => UserMutationResponse)
  async register(
    @Arg("registerInput") registerInput: RegisterInput
  ): Promise<UserMutationResponse> {
    try {
      const validateResult = validateRegisterInput(registerInput);
      if (validateResult)
        return { code: 400, success: false, ...validateResult };
      const { username, email, password } = registerInput;
      const existUser = await User.findOne({
        where: [{ username }, { email }],
      });
      if (existUser)
        return {
          code: 400,
          success: false,
          message: "Duplicated username or email",
          errors: [
            {
              field: existUser.username === username ? "username" : "email",
              message: `${
                existUser.username === username ? "Username" : "Email"
              } already taken`,
            },
          ],
        };
      const hash = await argon.hash(password);
      const newUser = User.create({ username, email, password: hash });
      await newUser.save();
      return {
        code: 200,
        success: true,
        message: "User registration successful",
        user: newUser,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @Mutation((_returns) => UserMutationResponse)
  async login(
    @Arg("loginInput") loginInput: LoginInput
  ): Promise<UserMutationResponse> {
    try {
      const { emailOrUsername, password } = loginInput;
      const user = await User.findOne({
        where: {
          [emailOrUsername.includes("@") ? "email" : "username"]:
            emailOrUsername,
        },
      });
      if (!user)
        return {
          code: 400,
          success: false,
          message: "User not found",
          errors: [
            {
              field: "usernameOrEmail",
              message: "Username or email incorrect",
            },
          ],
        };

      const validPassword = await argon.verify(user.password, password);

      if (!validPassword)
        return {
          code: 400,
          success: false,
          message: "Wrong password",
          errors: [{ field: "password", message: "Wrong password" }],
        };

      return {
        code: 200,
        success: true,
        message: "Logged in successfully",
        user,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }
}
