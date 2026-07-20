"use server";

import z from "zod";
import { postSchema } from "./schemas/blog";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth-server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export async function createBlogAction(values: z.infer<typeof postSchema>) {
    try {
        const parsed = postSchema.safeParse(values);

        if (!parsed.success) {
            throw new Error("something went wrong");
        }

        const token = await getToken();

        await fetchMutation(
            api.posts.createPost,
            {
                body: parsed.data.content,
                title: parsed.data.title,
            },
            { token }
        );
    } catch (e) {
        return {
            error: "Failed to create post",
        };
    }

    return redirect("/blog");
}
