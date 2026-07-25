"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BookmarkButtonProps {
    postId: Id<"posts">;
}

export function BookmarkButton({ postId }: BookmarkButtonProps) {
    const { isAuthenticated } = useConvexAuth();
    const bookmarkedIds = useQuery(api.bookmarks.getBookmarkedPostIds);
    const toggleBookmark = useMutation(api.bookmarks.toggleBookmark);

    const isBookmarked = bookmarkedIds?.includes(postId) ?? false;

    async function handleToggle() {
        if (!isAuthenticated) {
            toast.error("Please sign in to bookmark posts.");
            return;
        }
        try {
            const result = await toggleBookmark({ postId });
            toast.success(result.bookmarked ? "Post saved to bookmarks!" : "Bookmark removed.");
        } catch {
            toast.error("Something went wrong. Please try again.");
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className={cn(
                "flex items-center gap-1.5 transition-colors",
                isBookmarked
                    ? "text-primary hover:text-primary/80"
                    : "text-muted-foreground hover:text-foreground"
            )}
            title={isBookmarked ? "Remove bookmark" : "Save to bookmarks"}
        >
            <Bookmark
                className={cn(
                    "size-4 transition-all",
                    isBookmarked && "fill-current"
                )}
            />
            <span className="text-xs">{isBookmarked ? "Saved" : "Save"}</span>
        </Button>
    );
}
