"use client";

import { Preloaded, useMutation, usePreloadedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";

const REACTION_EMOJIS = [
    { type: "heart", emoji: "❤️" },
    { type: "fire", emoji: "🔥" },
    { type: "clap", emoji: "👏" },
    { type: "tada", emoji: "🎉" },
];

export function PostReactions(props: {
    preloadedReactions: Preloaded<typeof api.reactions.getReactions>;
    postId: string;
}) {
    const data = usePreloadedQuery(props.preloadedReactions);
    const toggleReaction = useMutation(api.reactions.toggleReaction);

    const handleToggle = async (type: string) => {
        try {
            await toggleReaction({ postId: props.postId as Id<"posts">, type });
        } catch (error: any) {
            if (error.message.includes("Unauthorized")) {
                toast.error("Please log in to react to posts");
            } else {
                toast.error("Failed to react to post");
            }
        }
    };

    return (
        <div className="flex flex-wrap gap-3 mt-8 pt-6 border-t">
            {REACTION_EMOJIS.map(({ type, emoji }) => {
                const count = data.counts[type] || 0;
                const hasReacted = data.userReactions.includes(type);

                return (
                    <Button
                        key={type}
                        variant={hasReacted ? "default" : "outline"}
                        size="sm"
                        className={cn(
                            "rounded-full px-4 h-9 transition-all hover:scale-105 active:scale-95",
                            hasReacted 
                                ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30" 
                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                        onClick={() => handleToggle(type)}
                    >
                        <span className="mr-2 text-lg leading-none">{emoji}</span>
                        <span className="font-semibold text-sm leading-none">{count > 0 ? count : ""}</span>
                    </Button>
                );
            })}
        </div>
    );
}
