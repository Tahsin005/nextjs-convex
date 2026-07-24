import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const getReactions = query({
    args: { postId: v.id("posts") },
    handler: async (ctx, args) => {
        const reactions = await ctx.db
            .query("reactions")
            .withIndex("by_post", (q) => q.eq("postId", args.postId))
            .collect();
            
        const user = await authComponent.safeGetAuthUser(ctx);
        const userId = user?._id;

        const counts: Record<string, number> = {};
        const userReactions: string[] = [];

        for (const r of reactions) {
            counts[r.type] = (counts[r.type] || 0) + 1;
            if (userId && r.userId === userId) {
                userReactions.push(r.type);
            }
        }

        return { counts, userReactions };
    },
});

export const toggleReaction = mutation({
    args: {
        postId: v.id("posts"),
        type: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await authComponent.safeGetAuthUser(ctx);
        if (!user) throw new Error("Unauthorized");

        const existing = await ctx.db
            .query("reactions")
            .withIndex("by_post_and_user_and_type", (q) =>
                q.eq("postId", args.postId)
                 .eq("userId", user._id)
                 .eq("type", args.type)
            )
            .first();

        if (existing) {
            await ctx.db.delete(existing._id);
        } else {
            await ctx.db.insert("reactions", {
                postId: args.postId,
                userId: user._id,
                type: args.type,
            });
        }
    },
});
