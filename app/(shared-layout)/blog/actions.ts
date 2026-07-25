"use server";

import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { cacheLife, cacheTag } from "next/cache";

export async function loadMorePostsAction(cursor: string, tag?: string) {
    "use cache";
    cacheLife("hours");
    cacheTag("blog");
    return await fetchQuery(api.posts.getPaginatedPosts, { 
        paginationOpts: { numItems: 6, cursor }, tag 
    });
}
