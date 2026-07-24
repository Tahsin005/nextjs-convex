import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    posts: defineTable({
        title: v.string(),
        body: v.string(),
        authorId: v.string(),
        imageStorageId: v.id("_storage"),
    })
        .searchIndex("search_title", {
            searchField: "title",
        })
        .searchIndex("search_body", {
            searchField: "body",
        }),
    comments: defineTable({
        postId: v.id("posts"),
        authorId: v.string(),
        authorName: v.string(),
        body: v.string(),
    }),
    reactions: defineTable({
        postId: v.id("posts"),
        userId: v.string(),
        type: v.string(),
    })
        .index("by_post", ["postId"])
        .index("by_post_and_user_and_type", ["postId", "userId", "type"]),
});
