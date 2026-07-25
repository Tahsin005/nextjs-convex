"use server";

import z from "zod";
import { postSchema, editPostSchema } from "./schemas/blog";
import { redirect } from "next/navigation";
import { getToken } from "@/lib/auth-server";
import { fetchMutation } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { revalidatePath, updateTag } from "next/cache";

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

        const tagsArray = parsed.data.tags
            ? parsed.data.tags.split(",").map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
            : [];

        await fetchMutation(
            api.posts.createPost,
            {
                body: parsed.data.content,
                title: parsed.data.title,
                imageStorageId: storageId,
                ...(tagsArray.length > 0 ? { tags: tagsArray } : {}),
            },
            { token }
        );
    } catch (e) {
        return {
            error: "Failed to create post",
        };
    }

    updateTag("blog")

    return redirect("/blog");
}

export async function deleteBlogAction(postId: string) {
    try {
        const token = await getToken();
        
        await fetchMutation(
            api.posts.deletePost,
            { postId: postId as any },
            { token }
        );
    } catch (e) {
        return {
            error: "Failed to delete post",
        };
    }

    updateTag("blog");
    return redirect("/blog");
}

export async function editBlogAction(postId: string, values: z.infer<typeof editPostSchema>) {
    try {
        const parsed = editPostSchema.safeParse(values);

        if (!parsed.success) {
            throw new Error("Invalid input");
        }

        const token = await getToken();
        let storageId = undefined;

        if (parsed.data.image && parsed.data.image.size > 0) {
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

            const json = await uploadResult.json();
            storageId = json.storageId;
        }

        const tagsArray = parsed.data.tags
            ? parsed.data.tags.split(",").map(t => t.trim().toLowerCase()).filter(t => t.length > 0)
            : [];

        await fetchMutation(
            api.posts.updatePost,
            {
                postId: postId as any,
                body: parsed.data.content,
                title: parsed.data.title,
                ...(storageId ? { imageStorageId: storageId } : {}),
                ...(tagsArray.length > 0 ? { tags: tagsArray } : { tags: [] }),
            },
            { token }
        );
    } catch (e) {
        return {
            error: "Failed to update post",
        };
    }

    updateTag("blog");
    return redirect(`/blog/${postId}`);
}
