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
        const imageUrl = await fetchMutation(
            api.posts.generateImageUploadUrl,
            {},
            { token }
        );

        const uploadResult = await fetch(imageUrl, {
            method: "POST",
            headers: {
                "Content-Type": parsed.data.image.type,
            },
            body: parsed.data.image,
        });

        if (!uploadResult.ok) {
            return {
                error: "Failed to upload image",
            };
        }

        const { storageId } = await uploadResult.json();

        await fetchMutation(
            api.posts.createPost,
            {
                body: parsed.data.content,
                title: parsed.data.title,
                imageStorageId: storageId,
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
