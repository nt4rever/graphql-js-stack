import * as argon from "argon2";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "~/entities/user";
import { TokenModel } from "~/models/Token";
import { Context } from "~/types/context";
import {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  UserMutationResponse,
} from "~/types/user.type";
import { COOKIE_NAME } from "~/utils/constants";
import { sendEmail } from "~/utils/sendEmail";
import { validateRegisterInput } from "~/utils/user.validate";
import { uuid } from "uuidv4";

@Resolver()
export class UserResolver {
  @Query((_return) => User, { nullable: true })
  async me(@Ctx() { req }: Context) {
    if (!req.session.userId) return null;
    const user = await User.findOne({
      where: {
        id: req.session.userId,
      },
    });
    return user;
  }

  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput") registerInput: RegisterInput,
    @Ctx() { req }: Context
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
      req.session.userId = newUser.id;

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

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput") loginInput: LoginInput,
    @Ctx() { req }: Context
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
              field: "emailOrUsername",
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

      req.session.userId = user.id;
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

  @Mutation((_return) => Boolean)
  async logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy((error) => {
        if (error) {
          console.log("DESTROYING SESSION ERROR", error);
          resolve(false);
        }
        resolve(true);
      });
    });
  }

  @Mutation((_return) => Boolean)
  async forgotPassword(
    @Arg("forgotPasswordInput") forgotPasswordInput: ForgotPasswordInput
  ): Promise<boolean> {
    const user = await User.findOne({
      where: {
        email: forgotPasswordInput.email,
      },
    });
    if (!user) return true;

    await TokenModel.findOneAndDelete({ userId: `${user.id}` });

    const resetToken = uuid();
    const hashedResetToken = await argon.hash(resetToken);
    await new TokenModel({ userId: user.id, token: hashedResetToken }).save();
    await sendEmail(
      forgotPasswordInput.email,
      `<a href='http://localhost:3000/change-password?token=${resetToken}&userId=${user.id}'>Click here to reset your password!</a>`
    );
    return true;
  }

  @Mutation((_return) => UserMutationResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("userId") userId: string,
    @Arg("changePasswordInput") changePasswordInput: ChangePasswordInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    if (changePasswordInput.newPassword.length <= 2)
      return {
        code: 400,
        success: false,
        message: "Invalid password",
        errors: [
          { field: "newPassword", message: "Length must be greater than 2" },
        ],
      };

    try {
      const resetPasswordTokenRecord = await TokenModel.findOne({ userId });
      if (!resetPasswordTokenRecord) {
        return {
          code: 400,
          success: false,
          message: "Invalid or expired password reset token",
          errors: [
            {
              field: "token",
              message: "Invalid or expired password reset token",
            },
          ],
        };
      }

      const resetPasswordTokenValid = argon.verify(
        resetPasswordTokenRecord.token,
        token
      );
      if (!resetPasswordTokenValid) {
        return {
          code: 400,
          success: false,
          message: "Invalid or expired password reset token",
          errors: [
            {
              field: "token",
              message: "Invalid or expired password reset token",
            },
          ],
        };
      }
      const userIdNum = parseInt(userId);
      const user = await User.findOne({
        where: {
          id: userIdNum,
        },
      });

      if (!user) {
        return {
          code: 400,
          success: false,
          message: "User no longer exists",
          errors: [{ field: "token", message: "User no longer exists" }],
        };
      }

      const updatedPassword = await argon.hash(changePasswordInput.newPassword);
      await User.update({ id: userIdNum }, { password: updatedPassword });
      await resetPasswordTokenRecord.deleteOne();
      req.session.userId = user.id;

      return {
        code: 200,
        success: true,
        message: "User password reset successfully",
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
