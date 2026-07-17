"use client";

import Image from "next/image";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Home() {
    const tasks = useQuery(api.tasks.get);
    return (
        <main className="flex min-h-screen flex-col items-center p-12 lg:p-24 bg-muted/10">
            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
                    <p className="text-muted-foreground mt-2">Manage your daily goals.</p>
                </div>

                {tasks === undefined ? (
                    <div className="text-center p-12 border rounded-xl bg-background shadow-sm animate-pulse text-muted-foreground">
                        Loading tasks...
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center p-12 border border-dashed rounded-xl bg-muted/30 text-muted-foreground">
                        No tasks found. Time to add some!
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {tasks.map((task: any) => (
                            <div 
                                key={task._id} 
                                className="flex items-center justify-between p-4 rounded-xl border bg-background shadow-sm transition-all hover:shadow-md"
                            >
                                <span className={task.isCompleted ? "line-through text-muted-foreground" : "font-medium"}>
                                    {task.text}
                                </span>
                                {task.isCompleted && (
                                    <span className="text-xs bg-green-500/10 text-green-600 dark:text-green-400 px-2.5 py-0.5 rounded-full font-medium">
                                        Done
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}