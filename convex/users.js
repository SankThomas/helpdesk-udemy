import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: { clerkId: v.string() },
  handler: async (ctx, { clerkId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    return user;
  },
});

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.optional(
      v.union(v.literal("user"), v.literal("agent"), v.literal("admin")),
    ),
  },
  handler: async (ctx, { clerkId, email, name, role }) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", clerkId))
      .first();

    if (existingUser) {
      return existingUser._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkId,
      email,
      name,
      role,
      createdAt: Date.now(),
    });

    return userId;
  },
});

export const getAllAgents = query({
  handler: async (ctx) => {
    const agents = await ctx.db
      .query("users")
      .filter((q) =>
        q.or(q.eq(q.field("role"), "agent"), q.eq(q.field("role"), "admin")),
      )
      .collect();

    return agents;
  },
});
