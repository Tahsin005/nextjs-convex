import { query } from "./_generated/server";
import { v } from "convex/values";
import { authComponent } from "./auth";

export const getUserProfile = query({
    args: {
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await authComponent.getAnyUserById(ctx, args.userId);

        if (!user) {
            return null;
        }

        return {
            _id: user._id,
            name: user.name ?? "Unknown",
            image: user.image ?? null,
            email: user.email,
        };
    },
});
