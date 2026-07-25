"use client";

import { Loader2, MessageSquare, Heart, Reply } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { commentSchema } from "@/app/schemas/comments";
import { toast } from "sonner";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import z from "zod";
import { cn } from "@/lib/utils";

type CommentType = {
    _id: Id<"comments">;
    _creationTime: number;
    postId: Id<"posts">;
    authorId: string;
    authorName: string;
    body: string;
    parentId?: Id<"comments">;
    likesCount: number;
    hasLiked: boolean;
};

function CommentForm({
    postId,
    parentId,
    onSuccess,
    onCancel,
}: {
    postId: Id<"posts">;
    parentId?: Id<"comments">;
    onSuccess?: () => void;
    onCancel?: () => void;
}) {
    const [isPending, startTransition] = useTransition();
    const createComment = useMutation(api.comments.createComment);

    const form = useForm({
        resolver: zodResolver(commentSchema),
        defaultValues: {
            body: "",
            postId,
            parentId,
        },
    });

    async function onSubmit(data: z.infer<typeof commentSchema>) {
        startTransition(async () => {
            try {
                await createComment(data);
                form.reset();
                toast.success(parentId ? "Reply posted" : "Comment posted");
                onSuccess?.();
            } catch {
                toast.error("Failed to post");
            }
        });
    }

    return (
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
                name="body"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field>
                        {!parentId && <FieldLabel>Comment</FieldLabel>}
                        <Textarea
                            aria-invalid={fieldState.invalid}
                            placeholder={parentId ? "Write a reply..." : "Share your thoughts"}
                            className={parentId ? "min-h-[80px]" : ""}
                            {...field}
                        />
                        {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                )}
            />

            <div className="flex gap-2">
                <Button type="submit" disabled={isPending} size={parentId ? "sm" : "default"}>
                    {isPending ? (
                        <>
                            <Loader2 className="size-4 animate-spin mr-2" />
                            <span>Posting...</span>
                        </>
                    ) : (
                        <span>{parentId ? "Reply" : "Comment"}</span>
                    )}
                </Button>
                {onCancel && (
                    <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isPending}>
                        Cancel
                    </Button>
                )}
            </div>
        </form>
    );
}

function CommentNode({
    comment,
    allComments,
    depth = 0,
    postId,
}: {
    comment: CommentType;
    allComments: CommentType[];
    depth?: number;
    postId: Id<"posts">;
}) {
    const [isReplying, setIsReplying] = useState(false);
    const toggleLike = useMutation(api.comments.toggleCommentLike);

    const replies = allComments.filter((c) => c.parentId === comment._id);
    const isMaxDepth = depth >= 1;

    const handleLike = async () => {
        try {
            await toggleLike({ commentId: comment._id });
        } catch (error: any) {
            if (error.message.includes("Not authenticated")) {
                toast.error("Please log in to like comments");
            } else {
                toast.error("Failed to like comment");
            }
        }
    };

    return (
        <div className={cn("flex flex-col gap-3", depth > 0 && "ml-4 md:ml-10 mt-4 border-l-2 border-border/50 pl-4 md:pl-6")}>
            <div className="flex gap-4">
                <Avatar className="size-8 shrink-0">
                    <AvatarImage src={`https://avatar.vercel.sh/${comment.authorName}`} alt={comment.authorName} />
                    <AvatarFallback>{comment.authorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{comment.authorName}</p>
                        <p className="text-muted-foreground text-xs">
                            {new Date(comment._creationTime).toLocaleDateString("de-DE")}
                        </p>
                    </div>

                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed pb-1">
                        {comment.body}
                    </p>

                    <div className="flex items-center gap-4 pt-1">
                        <button
                            onClick={handleLike}
                            className={cn(
                                "flex items-center gap-1.5 text-xs font-medium transition-colors hover:text-primary",
                                comment.hasLiked ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <Heart className={cn("size-3.5", comment.hasLiked && "fill-current")} />
                            {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                        </button>

                        {!isMaxDepth && (
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Reply className="size-3.5" />
                                Reply
                            </button>
                        )}
                    </div>

                    {isReplying && (
                        <div className="pt-3 pb-1">
                            <CommentForm
                                postId={postId}
                                parentId={comment._id}
                                onSuccess={() => setIsReplying(false)}
                                onCancel={() => setIsReplying(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {replies.length > 0 && (
                <div className="space-y-4">
                    {replies.map((reply) => (
                        <CommentNode
                            key={reply._id}
                            comment={reply}
                            allComments={allComments}
                            depth={depth + 1}
                            postId={postId}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export function CommentSection(props: {
    preloadedComments: Preloaded<typeof api.comments.getCommentsByPostId>;
}) {
    const params = useParams<{ postId: Id<"posts"> }>();
    const data = usePreloadedQuery(props.preloadedComments) as CommentType[];

    if (data === undefined) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center gap-2 border-b">
                    <MessageSquare className="size-5 text-muted-foreground" />
                    <Skeleton className="h-7 w-32" />
                </CardHeader>
                <CardContent className="space-y-8 pt-6">
                    <Skeleton className="h-24 w-full" />
                </CardContent>
            </Card>
        );
    }

    const rootComments = data.filter((c) => !c.parentId);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 border-b">
                <MessageSquare className="size-5" />
                <h2 className="text-xl font-bold">{data.length} Comments</h2>
            </CardHeader>

            <CardContent className="space-y-8 pt-6">
                <CommentForm postId={params.postId} />

                {data.length > 0 && <Separator />}

                <section className="space-y-6">
                    {rootComments.map((comment) => (
                        <CommentNode
                            key={comment._id}
                            comment={comment}
                            allComments={data}
                            postId={params.postId}
                        />
                    ))}
                </section>
            </CardContent>
        </Card>
    );
}