import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { calculateReadingTime } from "@/lib/utils";
import { Clock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const metadata: Metadata = {
    title: "Blog",
    description: "Read our latest articles and insights on web development, programming, and technology.",
    category: "Web development",
    openGraph: {
        title: "Blog | NextPro",
        description: "Read our latest articles and insights on web development, programming, and technology.",
        url: "/blog",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Blog | NextPro",
        description: "Read our latest articles and insights on web development, programming, and technology.",
    }
};

export default function BlogPage(props: { searchParams: Promise<{ tag?: string }> }) {
    return (
        <div className="py-12">
            <Suspense fallback={<SkeletonLoadingUi />}>
                <BlogContent searchParams={props.searchParams} />
            </Suspense>
        </div>
    );
};

async function BlogContent({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
    const params = await searchParams;
    const tag = params.tag;

    return (
        <>
            <div className="text-center pb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Our Blog
                </h1>
                <p className="pt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
                    Insights, thoughts, and trends from our team.
                </p>
                {tag && (
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <span className="text-sm text-muted-foreground">Filtering by:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                            #{tag}
                        </span>
                        <Link href="/blog" className="text-xs hover:underline text-muted-foreground ml-2">Clear</Link>
                    </div>
                )}
            </div>

            <LoadBlogList tag={tag} />
        </>
    );
}

async function LoadBlogList({ tag }: { tag?: string }) {
    "use cache";
    cacheLife("hours");
    cacheTag("blog");
    const data = await fetchQuery(api.posts.getPosts, { tag });
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data?.map((post) => (
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
                            <h1 className="text-2xl font-bold hover:text-primary">
                                {post.title}
                            </h1>
                        </Link>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2 mb-3">
                            <Link 
                                href={`/profile/${post.authorId}`} 
                                className="flex items-center gap-2 hover:text-primary transition-colors"
                            >
                                <Avatar className="size-6">
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
                        <p className="text-muted-foreground line-clamp-3">{post.body}</p>
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
    )
};

function SkeletonLoadingUi() {
    return (
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <div className="flex flex-col space-y-3" key={i}>
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <div className="space-y-2 flex flex-col">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/" />
                    </div>
                </div>
            ))}
        </div>
    );
}
