"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { calculateReadingTime } from "@/lib/utils";
import { loadMorePostsAction } from "@/app/(shared-layout)/blog/actions";

interface Post {
    _id: string;
    title: string;
    body: string;
    authorId: string;
    imageUrl: string | null;
    tags?: string[];
    author?: {
        name: string;
        image: string | null;
    };
}

interface InfinitePostsListProps {
    initialData: {
        page: Post[];
        continueCursor: string;
        isDone: boolean;
    };
    tag?: string;
}

export default function InfinitePostsList({ initialData, tag }: InfinitePostsListProps) {
    const [posts, setPosts] = useState<Post[]>(initialData.page);
    const [cursor, setCursor] = useState<string>(initialData.continueCursor);
    const [isDone, setIsDone] = useState<boolean>(initialData.isDone);
    const [isPending, startTransition] = useTransition();

    const sentinelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isDone && !isPending) {
                    startTransition(async () => {
                        try {
                            const result = await loadMorePostsAction(cursor, tag);
                            setPosts((prev) => {
                                const existingIds = new Set(prev.map(p => p._id));
                                const newPosts = result.page.filter(p => !existingIds.has(p._id));
                                return [...prev, ...newPosts];
                            });
                            setCursor(result.continueCursor);
                            setIsDone(result.isDone);
                        } catch (e) {
                            console.error("Failed to load more posts:", e);
                        }
                    });
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [cursor, isDone, isPending, tag]);

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">📭</div>
                <h2 className="text-xl font-semibold">No posts found</h2>
                <p className="text-muted-foreground mt-2">
                    {tag
                        ? `No posts tagged with "#${tag}" yet.`
                        : "Be the first to write something!"}
                </p>
                <Link href="/create" className={buttonVariants({ className: "mt-6" })}>
                    Write a Post
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <Card
                        key={post._id}
                        className="pt-0 flex flex-col group hover:shadow-lg transition-shadow duration-300"
                    >
                        <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                            <Image
                                src={
                                    post.imageUrl ??
                                    "https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                                }
                                alt={post.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <CardContent className="flex-1">
                            <Link href={`/blog/${post._id}`}>
                                <h2 className="text-2xl font-bold hover:text-primary transition-colors mt-2">
                                    {post.title}
                                </h2>
                            </Link>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 mb-3">
                                <Link
                                    href={`/profile/${post.authorId}`}
                                    className="flex items-center gap-2 hover:text-primary transition-colors"
                                >
                                    <Avatar className="size-6">
                                        <AvatarImage src={post.author?.image || ""} />
                                        <AvatarFallback>
                                            {post.author?.name?.[0] || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-foreground">
                                        {post.author?.name}
                                    </span>
                                </Link>
                                <div className="flex items-center">
                                    <Clock className="mr-1 size-3" />
                                    {calculateReadingTime(post.body)}
                                </div>
                            </div>
                            <p className="text-muted-foreground line-clamp-3">
                                {post.body.replace(/<[^>]+>/g, ' ')}
                            </p>
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-4">
                                    {post.tags.map((t: string) => (
                                        <Link
                                            key={t}
                                            href={`/blog?tag=${t}`}
                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
                                        >
                                            #{t}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <Link
                                className={buttonVariants({ className: "w-full" })}
                                href={`/blog/${post._id}`}
                            >
                                Read more
                            </Link>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Sentinel element for IntersectionObserver */}
            {!isDone && <div ref={sentinelRef} className="h-8 mt-8" />}

            {/* Loading indicator */}
            {isPending && (
                <div className="flex justify-center items-center gap-2 py-6 text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" />
                    <span className="text-sm">Loading more posts…</span>
                </div>
            )}

            {/* End of list */}
            {isDone && posts.length > 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                    You&apos;ve reached the end 🎉
                </p>
            )}
        </>
    );
}
