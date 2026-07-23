"use client";

import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Preloaded, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { Separator } from "../ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

export function CommentSection(props: {
    preloadedComments: Preloaded<typeof api.comments.getCommentsByPostId>;
}) {
    const params = useParams<{ postId: Id<"posts"> }>();
    const data = usePreloadedQuery(props.preloadedComments);

    if (data === undefined) {
        return <p>Loading...</p>;
    }
    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-2 border-b">
                <MessageSquare className="size-5" />
                <h2 className="text-xl font-bold">{data.length} Comments</h2>
            </CardHeader>

            <CardContent className="space-y-8">
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
                                            "en-US"
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