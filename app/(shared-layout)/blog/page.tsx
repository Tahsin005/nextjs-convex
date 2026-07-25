import { Skeleton } from "@/components/ui/skeleton";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import InfinitePostsList from "@/components/web/InfinitePostsList";
import { api } from "@/convex/_generated/api";
import { fetchQuery } from "convex/nextjs";
import { cacheLife, cacheTag } from "next/cache";

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
}

async function BlogContent({ searchParams }: { searchParams: Promise<{ tag?: string }> }) {
    const params = await searchParams;
    const tag = params.tag;

    // Fetch initial page with caching
    const initialData = await fetchCachedInitialPosts(tag);

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

            <InfinitePostsList initialData={initialData} tag={tag} />
        </>
    );
}

async function fetchCachedInitialPosts(tag?: string) {
    "use cache";
    cacheLife("hours");
    cacheTag("blog");
    return await fetchQuery(api.posts.getPaginatedPosts, { 
        paginationOpts: { numItems: 6, cursor: null }, 
        tag 
    });
}

function SkeletonLoadingUi() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
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
