"use client";
 
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useConvexAuth } from "convex/react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, Menu, Search, X } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SearchInput } from "./SearchInput";
import { useState } from "react";

export function Navbar() {
    const { isAuthenticated, isLoading } = useConvexAuth();
    const router = useRouter();
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return (
        <nav className="w-full py-5 flex items-center justify-between">
            <div className={cn("flex items-center gap-4 md:gap-8", isSearchOpen && "hidden md:flex")}>
                <Link href="/">
                    <h1 className="text-2xl md:text-3xl font-bold">
                        Next<span className="text-primary">Pro</span>
                    </h1>
                </Link>

                <div className="hidden md:flex items-center gap-2">
                    <Link className={buttonVariants({ variant: "ghost" })} href="/">
                        Home
                    </Link>
                    <Link className={buttonVariants({ variant: "ghost" })} href="/blog">
                        Blog
                    </Link>
                    <Link className={buttonVariants({ variant: "ghost" })} href="/create">
                        Create
                    </Link>
                </div>
            </div>

            <div className={cn("flex items-center gap-2", isSearchOpen && "hidden md:flex")}>
                <div className="hidden md:block mr-2">
                    <SearchInput />
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setIsSearchOpen(true)}
                >
                    <Search className="size-5" />
                    <span className="sr-only">Open search</span>
                </Button>

                {isLoading ? (
                    <div className="flex items-center justify-center px-4">
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                    </div>
                ) : isAuthenticated ? (
                    <Button
                        onClick={() =>
                            authClient.signOut({
                                fetchOptions: {
                                    onSuccess: () => {
                                        toast.success("Logged out successfully");
                                        router.push("/");
                                    },
                                    onError: (error) => {
                                        toast.error(error.error.message);
                                    },
                                },
                            })
                        }
                    >
                        Logout
                    </Button>
                ) : (
                    <>
                        <Link className={cn(buttonVariants(), "hidden sm:inline-flex")} href="/auth/sign-up">
                            Sign up
                        </Link>
                        <Link
                            className={buttonVariants({ variant: "outline" })}
                            href="/auth/login"
                        >
                            Login
                        </Link>
                    </>
                )}

                <ThemeToggle />

                <div className="md:hidden">
                    <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
                            <Menu className="size-5" />
                            <span className="sr-only">Toggle menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem render={<Link href="/" />}>
                                Home
                            </DropdownMenuItem>
                            <DropdownMenuItem render={<Link href="/blog" />}>
                                Blog
                            </DropdownMenuItem>
                            <DropdownMenuItem render={<Link href="/create" />}>
                                Create
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isSearchOpen && (
                <div className="flex items-center gap-2 w-full md:hidden animate-in fade-in-0 slide-in-from-top-1 duration-200">
                    <div className="flex-1">
                        <SearchInput />
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSearchOpen(false)}
                    >
                        <X className="size-5" />
                        <span className="sr-only">Close search</span>
                    </Button>
                </div>
            )}
        </nav>
    )
}