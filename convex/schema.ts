import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    posts: defineTable({
        title: v.string(),
        body: v.string(),
        authorId: v.string(),
        imageStorageId: v.id("_storage"),
        tags: v.optional(v.array(v.string())),
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
        parentId: v.optional(v.id("comments")),
    }).index("by_post", ["postId"]),
    commentLikes: defineTable({
        commentId: v.id("comments"),
        userId: v.string(),
    })
        .index("by_comment", ["commentId"])
        .index("by_comment_and_user", ["commentId", "userId"]),
    reactions: defineTable({
        postId: v.id("posts"),
        userId: v.string(),
        type: v.string(),
    })
        .index("by_post", ["postId"])
        .index("by_post_and_user_and_type", ["postId", "userId", "type"]),
    bookmarks: defineTable({
        postId: v.id("posts"),
        userId: v.string(),
    })
        .index("by_user", ["userId"])
        .index("by_post", ["postId"])
        .index("by_user_and_post", ["userId", "postId"]),
});
