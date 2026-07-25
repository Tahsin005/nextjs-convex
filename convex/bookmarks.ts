import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";

export const toggleBookmark = mutation({
    args: {
        postId: v.id("posts"),
    },
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) throw new ConvexError("Not authenticated");

        const existing = await ctx.db
            .query("bookmarks")
            .withIndex("by_user_and_post", (q) =>
                q.eq("userId", user._id).eq("postId", args.postId)
            )
            .unique();

        if (existing) {
            await ctx.db.delete(existing._id);
            return { bookmarked: false };
        } else {
            await ctx.db.insert("bookmarks", {
                userId: user._id,
                postId: args.postId,
            });
            return { bookmarked: true };
        }
    },
});

export const getBookmarkedPostIds = query({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) return [];

        const bookmarks = await ctx.db
            .query("bookmarks")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .collect();

        return bookmarks.map((b) => b.postId);
    },
});

export const getBookmarkedPosts = query({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) return [];

        const bookmarks = await ctx.db
            .query("bookmarks")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .collect();

        const posts = [];
        for (const bookmark of bookmarks) {
            const post = await ctx.db.get(bookmark.postId);
            if (post) {
                const resolvedImageUrl =
                    post.imageStorageId !== undefined
                        ? await ctx.storage.getUrl(post.imageStorageId)
                        : null;

                const author = await authComponent.getAnyUserById(ctx, post.authorId);

                posts.push({
                    ...post,
                    imageUrl: resolvedImageUrl,
                    author: {
                        name: author?.name ?? "Unknown",
                        image: author?.image ?? null,
                    },
                });
            }
        }

        return posts;
    },
});
