import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";
import { Doc } from "./_generated/dataModel";

export const createPost = mutation({
    args: {
        title: v.string(),
        body: v.string(),
        imageStorageId: v.id("_storage"),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);

        if (!user) {
            throw new ConvexError("Not authenticated");
        }

        const blogArticle = await ctx.db.insert("posts", {
            body: args.body,
            title: args.title,
            authorId: user._id,
            imageStorageId: args.imageStorageId,
            tags: args.tags,
        });

        return blogArticle;
    },
});

export const getPosts = query({
    args: {
        tag: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let posts = await ctx.db.query("posts").order("desc").collect();

        if (args.tag) {
            posts = posts.filter((post) => post.tags?.includes(args.tag!));
        }

        return await Promise.all(
            posts.map(async (post) => {
                const resolvedImageUrl =
                    post.imageStorageId !== undefined
                        ? await ctx.storage.getUrl(post.imageStorageId)
                        : null;

                const author = await authComponent.getAnyUserById(ctx, post.authorId);

                return {
                    ...post,
                    imageUrl: resolvedImageUrl,
                    author: {
                        name: author?.name ?? "Unknown",
                        image: author?.image ?? null,
                    },
                };
            })
        );
    },
});

export const generateImageUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const user = await authComponent.safeGetAuthUser(ctx);

        if (!user) {
            throw new ConvexError("Not authenticated");
        }

        return await ctx.storage.generateUploadUrl();
    },
});

export const getPostById = query({
    args: {
        postId: v.id("posts"),
    },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.postId);

        if (!post) {
            return null;
        }

        const resolvedImageUrl =
            post?.imageStorageId !== undefined
                ? await ctx.storage.getUrl(post.imageStorageId)
                : null;

        const author = await authComponent.getAnyUserById(ctx, post.authorId);

        return {
            ...post,
            imageUrl: resolvedImageUrl,
            author: {
                name: author?.name ?? "Unknown",
                image: author?.image ?? null,
            },
        };
    },
});

export const getPostsByAuthor = query({
    args: {
        authorId: v.string(),
    },
    handler: async (ctx, args) => {
        const posts = await ctx.db
            .query("posts")
            .filter((q) => q.eq(q.field("authorId"), args.authorId))
            .order("desc")
            .collect();

        return await Promise.all(
            posts.map(async (post) => {
                const resolvedImageUrl =
                    post.imageStorageId !== undefined
                        ? await ctx.storage.getUrl(post.imageStorageId)
                        : null;

                const author = await authComponent.getAnyUserById(ctx, post.authorId);

                return {
                    ...post,
                    imageUrl: resolvedImageUrl,
                    author: {
                        name: author?.name ?? "Unknown",
                        image: author?.image ?? null,
                    },
                };
            })
        );
    },
});

interface searchResultTypes {
    _id: string;
    title: string;
    body: string;
}

export const searchPosts = query({
    args: {
        term: v.string(),
        limit: v.number(),
    },
    handler: async (ctx, args) => {
        const limit = args.limit;

        const results: Array<searchResultTypes> = [];

        const seen = new Set();

        const pushDocs = async (docs: Array<Doc<"posts">>) => {
            for (const doc of docs) {
                if (seen.has(doc._id)) continue;

                seen.add(doc._id);
                results.push({
                    _id: doc._id,
                    title: doc.title,
                    body: doc.body,
                });
                if (results.length >= limit) break;
            }
        };

        const titleMatches = await ctx.db
            .query("posts")
            .withSearchIndex("search_title", (q) => q.search("title", args.term))
            .take(limit);

        await pushDocs(titleMatches);

        if (results.length < limit) {
            const bodyMatches = await ctx.db
                .query("posts")
                .withSearchIndex("search_body", (q) => q.search("body", args.term))
                .take(limit);

            await pushDocs(bodyMatches);
        }

        return results;
    },
});

export const deletePost = mutation({
    args: {
        postId: v.id("posts"),
    },
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) throw new ConvexError("Not authenticated");

        const post = await ctx.db.get(args.postId);
        if (!post) throw new ConvexError("Post not found");

        if (post.authorId !== user._id) {
            throw new ConvexError("Unauthorized to delete this post");
        }

        if (post.imageStorageId) {
            await ctx.storage.delete(post.imageStorageId);
        }

        const comments = await ctx.db
            .query("comments")
            .filter((q) => q.eq(q.field("postId"), args.postId))
            .collect();

        for (const comment of comments) {
            await ctx.db.delete(comment._id);
        }

        await ctx.db.delete(args.postId);
    },
});

export const updatePost = mutation({
    args: {
        postId: v.id("posts"),
        title: v.string(),
        body: v.string(),
        imageStorageId: v.optional(v.id("_storage")),
        tags: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) throw new ConvexError("Not authenticated");

        const post = await ctx.db.get(args.postId);
        if (!post) throw new ConvexError("Post not found");

        if (post.authorId !== user._id) {
            throw new ConvexError("Unauthorized to update this post");
        }

        const updateData: any = {
            title: args.title,
            body: args.body,
        };

        if (args.tags !== undefined) {
            updateData.tags = args.tags;
        }

        if (args.imageStorageId) {
            if (post.imageStorageId) {
                await ctx.storage.delete(post.imageStorageId);
            }
            updateData.imageStorageId = args.imageStorageId;
        }

        await ctx.db.patch(args.postId, updateData);
    },
});
