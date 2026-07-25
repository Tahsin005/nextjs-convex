"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Authenticated, Unauthenticated } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Bookmark, BookOpen } from "lucide-react";
import { calculateReadingTime } from "@/lib/utils";
import { BookmarkButton } from "@/components/web/BookmarkButton";
import { Skeleton } from "@/components/ui/skeleton";

function BookmarkedPostsList() {
    const posts = useQuery(api.bookmarks.getBookmarkedPosts);

    if (posts === undefined) {
        return (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div className="flex flex-col space-y-3" key={i}>
                        <Skeleton className="h-48 w-full rounded-xl" />
                        <div className="space-y-2 flex flex-col">
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl scale-150" />
                    <div className="relative size-20 rounded-full bg-secondary flex items-center justify-center">
                        <BookOpen className="size-10 text-muted-foreground" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Your reading list is empty</h2>
                    <p className="text-muted-foreground max-w-sm">
                        Tap the bookmark icon on any post to save it here for later.
                    </p>
                </div>
                <Link href="/blog" className={buttonVariants()}>
                    Explore Blog
                </Link>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
                <Card key={post._id} className="pt-0 flex flex-col">
                    <div className="relative h-48 w-full overflow-hidden">
                        <Image
                            src={
                                post.imageUrl ??
                                "https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            }
                            alt={post.title}
                            fill
                            className="rounded-t-lg object-cover"
                        />
                    </div>
                    <CardContent className="flex-1">
                        <Link href={`/blog/${post._id}`}>
                            <h2 className="text-xl font-bold hover:text-primary transition-colors mt-1">
                                {post.title}
                            </h2>
                        </Link>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2 mb-3">
                            <Link
                                href={`/profile/${post.authorId}`}
                                className="flex items-center gap-1.5 hover:text-primary transition-colors"
                            >
                                <Avatar className="size-5">
                                    <AvatarImage src={post.author?.image || ""} />
                                    <AvatarFallback>{post.author?.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">{post.author?.name}</span>
                            </Link>
                            <div className="flex items-center">
                                <Clock className="mr-1 size-3" />
                                {calculateReadingTime(post.body)}
                            </div>
                        </div>
                        <p className="text-muted-foreground line-clamp-3 text-sm">{post.body}</p>
                        {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
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
                    <CardFooter className="flex gap-2">
                        <Link
                            className={buttonVariants({ className: "flex-1" })}
                            href={`/blog/${post._id}`}
                        >
                            Read more
                        </Link>
                        <BookmarkButton postId={post._id} />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

export default function BookmarksPage() {
    return (
        <div className="py-12">
            <div className="text-center pb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <Bookmark className="size-8 text-primary" />
                    <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                        Your Bookmarks
                    </h1>
                </div>
                <p className="pt-2 max-w-2xl mx-auto text-xl text-muted-foreground">
                    Posts you&apos;ve saved for later reading.
                </p>
            </div>

            <Authenticated>
                <BookmarkedPostsList />
            </Authenticated>

            <Unauthenticated>
                <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-primary/10 blur-xl scale-150" />
                        <div className="relative size-20 rounded-full bg-secondary flex items-center justify-center">
                            <Bookmark className="size-10 text-muted-foreground" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold">Sign in to see your bookmarks</h2>
                        <p className="text-muted-foreground max-w-sm">
                            Create an account or sign in to start saving posts to your reading list.
                        </p>
                    </div>
                    <Link href="/auth/login" className={buttonVariants()}>
                        Sign In
                    </Link>
                </div>
            </Unauthenticated>
        </div>
    );
}
