import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CommentSection } from "@/components/web/CommentSection";
import { PostPresence } from "@/components/web/PostPresence";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { fetchQuery, preloadQuery } from "convex/nextjs";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

interface PostIdRouteProps {
    params: Promise<{
        postId: Id<"posts">;
    }>;
}

export async function generateMetadata({
    params,
}: PostIdRouteProps): Promise<Metadata> {
    const { postId } = await params;

    const post = await fetchQuery(api.posts.getPostById, { postId: postId });

    if (!post) {
        return {
            title: "Post not found",
            description: "The post you are looking for does not exist.",
        };
    }

    const description = post.body.length > 160 ? `${post.body.substring(0, 157)}...` : post.body;
    const imageUrl = post.imageUrl ?? "https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

    return {
        title: post.title,
        description: description,
        category: "Web development",
        authors: [{ name: "MD. Tahsin Ferdous" }],
        openGraph: {
            title: post.title,
            description: description,
            type: "article",
            publishedTime: new Date(post._creationTime).toISOString(),
            url: `/blog/${postId}`,
            images: [
                {
                    url: imageUrl,
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: description,
            images: [imageUrl],
        },
    };
}

export default async function PostIdRoute({ params }: PostIdRouteProps) {
    const { postId } = await params;

    const token = await getToken();

    const [post, preloadedComments, userId] = await Promise.all([
        await fetchQuery(api.posts.getPostById, { postId: postId }),
        await preloadQuery(api.comments.getCommentsByPostId, {
            postId: postId,
        }),
        await fetchQuery(api.presence.getUserId, {}, { token }),
    ]);

    if (!userId) {
        redirect("/auth/login");
    }

    if (!post) {
        return (
            <div className="max-w-3xl mx-auto py-32 px-4 text-center">
                <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
                    <div className="p-6 bg-muted rounded-full">
                        <FileQuestion className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Post not found</h1>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            The post you are looking for doesn't exist or has been removed.
                        </p>
                    </div>
                    <Link
                        href="/blog"
                        className={buttonVariants({ variant: "default", className: "mt-4" })}
                    >
                        <ArrowLeft className="mr-2 size-4" />
                        Back to all posts
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in duration-500 relative">
            <Link
                className={buttonVariants({ variant: "outline", className: "mb-4" })}
                href="/blog"
            >
                <ArrowLeft className="size-4" />
                Back to blog
            </Link>

            <div className="relative w-full h-[400px] mb-8 rounded-xl overflow-hidden shadow-sm">
                <Image
                    src={
                        post.imageUrl ??
                        "https://images.unsplash.com/photo-1761019646782-4bc46ba43fe9?q=80&w=1631&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    }
                    alt={post.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-500"
                />
            </div>

            <div className="space-y-4 flex flex-col">
                <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    {post.title}
                </h1>

                <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">
                        Posted on:{" "}
                        {new Date(post._creationTime).toLocaleDateString("de-DE")}
                    </p>
                    {userId && <PostPresence roomId={post._id} userId={userId} />}
                </div>

                <Separator className="my-8" />

                <p className="text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {post.body}
                </p>

                <Separator className="my-8" />

                <CommentSection preloadedComments={preloadedComments} />
            </div>
        </div>
    )
}