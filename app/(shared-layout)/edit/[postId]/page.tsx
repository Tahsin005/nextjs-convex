import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { EditPostForm } from "../../../../components/web/EditPostForm";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface EditPostRouteProps {
    params: Promise<{
        postId: Id<"posts">;
    }>;
}

export default function EditPostRoute({ params }: EditPostRouteProps) {
    return (
        <Suspense fallback={<EditPostSkeleton />}>
            <EditPostContent params={params} />
        </Suspense>
    );
}

async function EditPostContent({ params }: { params: EditPostRouteProps["params"] }) {
    const { postId } = await params;
    const token = await getToken();

    const [post, userId] = await Promise.all([
        fetchQuery(api.posts.getPostById, { postId }),
        fetchQuery(api.presence.getUserId, {}, { token })
    ]);

    if (!userId) {
        redirect("/auth/login");
    }

    if (!post) {
        redirect("/blog");
    }

    if (post.authorId !== userId) {
        redirect(`/blog/${postId}`);
    }

    return (
        <div className="py-12 animate-in fade-in duration-500">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Edit Post
                </h1>
                <p className="text-xl text-muted-foreground pt-4">
                    Update your thoughts and share them with the world
                </p>
            </div>

            <EditPostForm post={post} />
        </div>
    );
}

function EditPostSkeleton() {
    return (
        <div className="py-12 animate-in fade-in duration-500">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Edit Post
                </h1>
                <p className="text-xl text-muted-foreground pt-4">
                    Update your thoughts and share them with the world
                </p>
            </div>

            <div className="w-full max-w-xl mx-auto border rounded-xl shadow-sm bg-card text-card-foreground">
                <div className="flex flex-col space-y-1.5 p-6">
                    <Skeleton className="h-6 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="p-6 pt-0 space-y-4">
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-12" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-[200px] w-full" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                    <Skeleton className="h-10 w-32 mt-4" />
                </div>
            </div>
        </div>
    );
}
