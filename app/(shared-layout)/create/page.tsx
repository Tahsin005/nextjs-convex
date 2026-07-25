"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const TiptapEditor = dynamic(
    () => import("@/components/web/TiptapEditor").then(mod => mod.TiptapEditor),
    { ssr: false, loading: () => <Skeleton className="w-full min-h-[300px]" /> }
);
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { postSchema } from "@/app/schemas/blog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { createBlogAction } from "@/app/action";

export default function CreateRoute() {
    const [isPending, startTransition] = useTransition();
    const form = useForm({
        resolver: zodResolver(postSchema),
        defaultValues: {
            content: "",
            title: "",
            image: undefined,
            tags: "",
        },
    });

    function onSubmit(values: z.infer<typeof postSchema>) {
        startTransition(async () => {
            console.log("hey this runs on the client side");

            await createBlogAction(values);
        });
    }

    return (
        <div className="py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Create Post
                </h1>
                <p className="text-xl text-muted-foreground pt-4">
                    Share your thoughts with the big world
                </p>
            </div>

            <Card className="w-full max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle>Create Blog Article</CardTitle>
                    <CardDescription>Create a new blog article</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <FieldGroup className="gap-y-4">
                            <Controller
                                name="title"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Title</FieldLabel>
                                        <Input
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Super cool title"
                                            {...field}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="content"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Content</FieldLabel>
                                        <TiptapEditor
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="tags"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Tags (optional)</FieldLabel>
                                        <Input
                                            aria-invalid={fieldState.invalid}
                                            placeholder="tech, react, nextjs"
                                            {...field}
                                            value={field.value || ""}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Controller
                                name="image"
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field>
                                        <FieldLabel>Image</FieldLabel>
                                        <Input
                                            aria-invalid={fieldState.invalid}
                                            placeholder="Image"
                                            type="file"
                                            accept="image/*"
                                            onChange={(event) => {
                                                const file = event.target.files?.[0];
                                                field.onChange(file);
                                            }}
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            <Button type="submit" disabled={isPending}>
                                {isPending ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        <span>Loading...</span>
                                    </>
                                ) : (
                                    <span>Create Post</span>
                                )}
                            </Button>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}