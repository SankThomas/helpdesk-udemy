import { action, mutation, query } from "./_generated/server";
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

export const getAllUsers = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").order("desc").collect();
    return users;
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("agent"), v.literal("admin")),
  },
  handler: async (ctx, { userId, role }) => {
    await ctx.db.patch(userId, { role });
  },
});

export const inviteUser = action({
  args: {
    email: v.string(),
    role: v.union(v.literal("user"), v.literal("agent"), v.literal("admin")),
  },
  handler: async (_, args) => {
    // eslint-disable-next-line no-undef
    const clerkSecret = process.env.VITE_CLERK_SECRET_KEY;

    if (!clerkSecret) throw new Error("Missing Clerk Secret Key");

    const res = await fetch("https://api.clerk.com/v1/invitations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${clerkSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: args.email,
        public_metadata: { role: args.role },
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(error);
    }
  },
});
