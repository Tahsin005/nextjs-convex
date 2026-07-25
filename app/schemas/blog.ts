import z from "zod";

export const postSchema = z.object({
    title: z.string().min(3).max(50),
    content: z.string().min(10),
    image: z.instanceof(File),
    tags: z.string().optional(),
});

export const editPostSchema = z.object({
    title: z.string().min(3).max(50),
    content: z.string().min(10),
    image: z.instanceof(File).optional(),
    tags: z.string().optional(),
});
