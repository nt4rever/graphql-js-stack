import {
  Arg,
  Ctx,
  FieldResolver,
  ID,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { LessThan } from "typeorm";
import { Post } from "~/entities/post";
import { User } from "~/entities/user";
import { checkAuth } from "~/middleware/checkAuth";
import { PaginationPosts } from "~/types/PaginationPosts";
import { Context } from "~/types/context";
import {
  CreatePostInput,
  PostMutationResponse,
  UpdatePostInput,
} from "~/types/post.type";

@Resolver((_of) => Post)
export class PostResolver {
  @FieldResolver((_return) => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver((_return) => String)
  async user(@Root() root: Post) {
    return await User.findOne({
      where: {
        id: root.userId,
      },
    });
  }

  @Query((_return) => PaginationPosts, { nullable: true })
  async posts(
    @Arg("_limit", (_type) => Int) limit: number,
    @Arg("cursor", { nullable: true }) cursor?: string
  ): Promise<PaginationPosts | null> {
    const totalPostCount = await Post.count();
    const realLimit = Math.min(10, limit);

    const findOptions: {
      [key: string]: any;
    } = {
      order: {
        createdAt: "DESC",
      },
      take: realLimit,
    };

    if (cursor)
      findOptions.where = {
        createdAt: LessThan(cursor),
      };

    const lastPost = await Post.find({ order: { createdAt: "ASC" }, take: 1 });
    const posts = await Post.find(findOptions);

    let hasMore = false;
    if (posts.length && lastPost.length)
      hasMore =
        posts[posts.length - 1].createdAt.toString() !==
        lastPost[0].createdAt.toString();

    return {
      totalCount: totalPostCount,
      cursor:
        posts.length > 0
          ? new Date(posts[posts.length - 1].createdAt)
          : cursor
          ? new Date(cursor)
          : new Date(),
      hasMore,
      paginatedPosts: posts,
    };
  }

  @Query((_return) => Post, { nullable: true })
  async post(@Arg("id", (_type) => ID) id: number): Promise<Post | null> {
    const post = await Post.findOne({
      where: { id },
    });
    return post;
  }

  @UseMiddleware(checkAuth)
  @Mutation((_return) => PostMutationResponse)
  async createPost(
    @Arg("createPostInput") { text, title }: CreatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const newPost = Post.create({
        title,
        text,
        userId: req.session.userId,
      });
      const post = await newPost.save();
      return {
        code: 200,
        success: true,
        message: "Post created successfully",
        post,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @UseMiddleware(checkAuth)
  @Mutation((_return) => PostMutationResponse)
  async updatePost(
    @Arg("updatePostInput") { id, text, title }: UpdatePostInput,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({
        where: { id, userId: req.session.userId },
      });
      if (!existingPost)
        return {
          code: 400,
          success: false,
          message: "Post not found",
        };
      existingPost.title = title || existingPost.title;
      existingPost.text = text || existingPost.text;
      existingPost.save();

      return {
        code: 200,
        success: true,
        message: "Post updated successfully",
        post: existingPost,
      };
    } catch (error) {
      return {
        code: 500,
        success: false,
        message: `Internal server error ${error.message}`,
      };
    }
  }

  @UseMiddleware(checkAuth)
  @Mutation((_return) => PostMutationResponse)
  async deletePost(
    @Arg("id", (_type) => ID) id: number,
    @Ctx() { req }: Context
  ): Promise<PostMutationResponse> {
    const existingPost = await Post.findOne({
      where: { id, userId: req.session.userId },
    });
    if (!existingPost)
      return {
        code: 400,
        success: false,
        message: "Post not found",
      };
    await Post.delete(id);
    return { code: 200, success: true, message: "Post deleted successfully" };
  }
}
