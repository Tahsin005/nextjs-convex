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
import { Textarea } from "@/components/ui/textarea";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { editPostSchema } from "@/app/schemas/blog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { editBlogAction } from "@/app/action";
import { toast } from "sonner";
import Image from "next/image";

export function EditPostForm({ post }: { post: any }) {
    const [isPending, startTransition] = useTransition();
    const form = useForm({
        resolver: zodResolver(editPostSchema),
        defaultValues: {
            content: post.body,
            title: post.title,
            image: undefined,
        },
    });

    function onSubmit(values: z.infer<typeof editPostSchema>) {
        startTransition(async () => {
            const result = await editBlogAction(post._id, values);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success("Post updated successfully!");
            }
        });
    }

    return (
        <Card className="w-full max-w-xl mx-auto">
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
                                    <Textarea
                                        aria-invalid={fieldState.invalid}
                                        placeholder="Super cool blog content"
                                        className="min-h-[200px]"
                                        {...field}
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
                                    <FieldLabel>Cover Image (optional)</FieldLabel>
                                    {post.imageUrl && !form.watch("image") && (
                                        <div className="relative h-32 w-full overflow-hidden rounded-md mb-2">
                                            <Image 
                                                src={post.imageUrl} 
                                                alt="Current cover" 
                                                fill 
                                                className="object-cover" 
                                            />
                                        </div>
                                    )}
                                    <Input
                                        aria-invalid={fieldState.invalid}
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => {
                                            const file = event.target.files?.[0];
                                            field.onChange(file);
                                        }}
                                    />
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Upload a new image to replace the current one.
                                    </p>
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
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </Button>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    );
}
