import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authComponent } from "./auth";

export const getCommentsByPostId = query({
    args: {
        postId: v.id("posts"),
    },
    handler: async (ctx, args) => {
        const comments = await ctx.db
            .query("comments")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .order("asc")
            .collect();

        const user = await authComponent.safeGetAuthUser(ctx);
        const userId = user?._id;

        const enrichedComments = await Promise.all(
            comments.map(async (comment) => {
                const likes = await ctx.db
                    .query("commentLikes")
                    .withIndex("by_comment", (q) => q.eq("commentId", comment._id))
                    .collect();

                return {
                    ...comment,
                    likesCount: likes.length,
                    hasLiked: userId ? likes.some((l) => l.userId === userId) : false,
                };
            })
        );

        return enrichedComments;
    },
});

export const toggleCommentLike = mutation({
    args: {
        commentId: v.id("comments"),
    },
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) throw new ConvexError("Not authenticated");

        const existing = await ctx.db
            .query("commentLikes")
            .withIndex("by_comment_and_user", (q) =>
                q.eq("commentId", args.commentId).eq("userId", user._id)
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        } else {
            await ctx.db.insert("commentLikes", {
                commentId: args.commentId,
                userId: user._id,
            });
        }
    },
});

export const createComment = mutation({
    args: {
        body: v.string(),
        postId: v.id("posts"),
        parentId: v.optional(v.id("comments")),
    },
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);

        if (!user) {
            throw new ConvexError("Not authenticated");
        }

        return await ctx.db.insert("comments", {
            postId: args.postId,
            body: args.body,
            authorId: user._id,
            authorName: user.name,
            parentId: args.parentId,
        });
    },
});
