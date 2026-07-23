"use client";

import { Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema } from "@/app/schemas/comments";
import { toast } from "sonner";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import z from "zod";

export function CommentSection(props: {
    preloadedComments: Preloaded<typeof api.comments.getCommentsByPostId>;
}) {
    const params = useParams<{ postId: Id<"posts"> }>();
    const data = usePreloadedQuery(props.preloadedComments);

    const [isPending, startTransition] = useTransition();

    const createComment = useMutation(api.comments.createComment);
    const form = useForm({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            body: "",
            postId: params.postId,
        },
    });

    async function onSubmit(data: z.infer<typeof commentSchema>) {
        startTransition(async () => {
            try {
                await createComment(data);
                form.reset();
                toast.success("Comment posted");
            } catch {
                toast.error("Failed to create post");
            }
        });
    }

    if (data === undefined) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-2 border-b">
                    <MessageSquare className="size-5 text-muted-foreground" />
                    <Skeleton className="h-7 w-32" />
                </CardHeader>

                <CardContent className="space-y-8 pt-6">
                    <div className="space-y-4">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-10 w-24" />
                    </div>

                    <Separator />

                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="size-10 rounded-full shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-4/5" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 border-b">
                <MessageSquare className="size-5" />
                <h2 className="text-xl font-bold">{data.length} Comments</h2>
            </CardHeader>

            <CardContent className="space-y-8">
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <Controller
                        name="body"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field>
                                <FieldLabel>Comment</FieldLabel>
                                <Textarea
                                    aria-invalid={fieldState.invalid}
                                    placeholder="Share your thoughts"
                                    {...field}
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
                            <span>Comment</span>
                        )}
                    </Button>
                </form>

                {data?.length > 0 && <Separator />}

                <section className="space-y-6">
                    {data?.map((comment) => (
                        <div key={comment._id} className="flex gap-4">
                            <Avatar className="size-10 shrink-0">
                                <AvatarImage
                                    src={`https://avatar.vercel.sh/${comment.authorName}`}
                                    alt={comment.authorName}
                                />
                                <AvatarFallback>
                                    {comment.authorName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold text-sm">{comment.authorName}</p>
                                    <p className="text-muted-foreground text-xs">
                                        {new Date(comment._creationTime).toLocaleDateString(
                                            "de-DE"
                                        )}
                                    </p>
                                </div>

                                <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                                    {comment.body}
                                </p>
                            </div>
                        </div>
                    ))}
                </section>
            </CardContent>
        </Card>
    )
}