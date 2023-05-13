import {
  Arg,
  ID,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { Post } from "~/entities/post";
import { checkAuth } from "~/middleware/checkAuth";
import {
  CreatePostInput,
  PostMutationResponse,
  UpdatePostInput,
} from "~/types/post.type";

@Resolver()
export class PostResolver {
  @Query((_return) => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
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
    @Arg("createPostInput") { text, title }: CreatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const newPost = Post.create({
        title,
        text,
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
    @Arg("updatePostInput") { id, text, title }: UpdatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({ where: { id } });
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
    @Arg("id", (_type) => ID) id: number
  ): Promise<PostMutationResponse> {
    const existingPost = await Post.findOne({ where: { id } });
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
