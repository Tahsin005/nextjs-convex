import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { calculateReadingTime } from "@/lib/utils";
import { Clock, FileQuestion } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";

interface ProfileRouteProps {
    params: Promise<{
        userId: string;
    }>;
}

export async function generateMetadata({
    params,
}: ProfileRouteProps): Promise<Metadata> {
    const { userId } = await params;
    const user = await fetchQuery(api.users.getUserProfile, { userId });

    if (!user) {
        return {
            title: "User not found",
        };
    }

    return {
        title: `${user.name}'s Profile`,
        description: `Read all posts by ${user.name} on NextPro.`,
    };
}

export default async function ProfileRoute({ params }: ProfileRouteProps) {
    const { userId } = await params;

    const user = await fetchQuery(api.users.getUserProfile, { userId });

    if (!user) {
        return (
            <div className="max-w-3xl mx-auto py-32 px-4 text-center">
                <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                    <div className="p-6 bg-muted rounded-full">
                        <FileQuestion className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">User not found</h1>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            The user profile you are looking for doesn't exist.
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className={buttonVariants({ variant: "default", className: "mt-4" })}
                    >
                        Back to all posts
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 animate-in fade-in duration-500">
            {/* Profile Header */}
            <div className="max-w-3xl mx-auto flex flex-col items-center text-center mb-16">
                <Avatar className="size-32 mb-6 shadow-md border-4 border-background">
                    <AvatarImage src={user.image || ""} />
                    <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                        {user.name?.[0] || "?"}
                    </AvatarFallback>
                </Avatar>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    {user.name}
                </h1>
                <p className="text-xl text-muted-foreground pt-4">
                    Author on NextPro
                </p>
            </div>

            {/* Author's Posts */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold tracking-tight border-b pb-4">
                    Posts by {user.name}
                </h2>
                <Suspense fallback={<SkeletonLoadingUi />}>
                    <LoadAuthorPosts authorId={userId} />
                </Suspense>
            </div>
        </div>
    );
}

async function LoadAuthorPosts({ authorId }: { authorId: string }) {
    const posts = await fetchQuery(api.posts.getPostsByAuthor, { authorId });

    if (posts.length === 0) {
        return (
            <div className="py-12 text-center text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                This author hasn't published any posts yet.
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
                <Card key={post._id} className="pt-0">
                    <div className="relative h-48 w-full overflow-hidden">
                        <Image
                            src={
                                post.imageUrl ??
                                "https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            }
                            alt="image"
                            fill
                            className="rounded-t-lg object-cover"
                        />
                    </div>
                    <CardContent>
                        <Link href={`/blog/${post._id}`}>
                            <h1 className="text-2xl font-bold hover:text-primary mt-4">
                                {post.title}
                            </h1>
                        </Link>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 mb-3">
                            <div className="flex items-center gap-2">
                                <Avatar className="size-6">
                                    <AvatarImage src={post.author?.image || ""} />
                                    <AvatarFallback>{post.author?.name?.[0] || "?"}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">{post.author?.name}</span>
                            </div>
                            <div className="flex items-center">
                                <Clock className="mr-1 size-3" />
                                {calculateReadingTime(post.body)}
                            </div>
                        </div>
                        <p className="text-muted-foreground line-clamp-3">{post.body}</p>
                    </CardContent>
                    <CardFooter>
                        <Link
                            className={buttonVariants({
                                className: "w-full",
                            })}
                            href={`/blog/${post._id}`}
                        >
                            Read more
                        </Link>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

function SkeletonLoadingUi() {
    return (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <div className="flex flex-col space-y-3" key={i}>
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <div className="space-y-2 flex flex-col">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                    </div>
                </div>
            ))}
        </div>
    );
}
