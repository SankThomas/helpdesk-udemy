import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createTicket = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("urgent"),
    ),
    status: v.union(
      v.literal("open"),
      v.literal("pending"),
      v.literal("resolved"),
      v.literal("closed"),
    ),
    userId: v.id("users"),
  },
  handler: async (ctx, { title, description, priority, userId }) => {
    const ticketId = await ctx.db.insert("tickets", {
      title,
      description,
      priority,
      status: "open",
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Create notification for agents and admins
    const agents = ctx.db
      .query("users")
      .filter((q) =>
        q.or(q.eq(q.field("role"), "agent"), q.eq(q.field("role"), "admin")),
      )
      .collect();

    const user = await ctx.db.get(userId);

    await Promise.all(
      (await agents).map((agent) =>
        ctx.db.insert("notifications", {
          userId: agent._id,
          type: "ticket_created",
          title: "New Ticket Created",
          message: `${user?.name} created a new ${priority} priority ticket: ${title}`,
          ticketId,
          fromUserId: userId,
          read: false,
          createdAt: Date.now(),
        }),
      ),
    );

    return ticketId;
  },
});

export const searchTickets = query({
  args: {
    searchTerm: v.string(),
    userRole: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, { searchTerm, userRole, userId }) => {
    if (!searchTerm.trim()) return [];

    const searchResults = await ctx.db
      .query("tickets")
      .withSearchIndex("search_title_desc", (q) =>
        q.search("title", searchTerm),
      )
      .collect();

    // Apply role-based filtering
    let filteredResults = searchResults;
    if (userRole === "user" && userId) {
      filteredResults = searchResults.filter(
        (ticket) => ticket.userId === userId,
      );
    }

    const ticketWithUsers = await Promise.all(
      filteredResults.map(async (ticket) => {
        const user = await ctx.db.get(ticket.userId);
        const assginedUser = ticket.assignedTo
          ? await ctx.db.get(ticket.assignedTo)
          : null;

        return {
          ...ticket,
          user,
          assginedUser,
        };
      }),
    );

    return ticketWithUsers;
  },
});

export const getTicketById = query({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) return null;

    const user = await ctx.db.get(ticket.userId);
    const assignedUser = ticket.assignedTo
      ? await ctx.db.get(ticket.assignedTo)
      : null;

    return {
      ...ticket,
      user,
      assignedUser,
    };
  },
});

export const updateTicket = mutation({
  args: {
    ticketId: v.id("tickets"),
    status: v.optional(
      v.union(
        v.literal("open"),
        v.literal("pending"),
        v.literal("resolved"),
        v.literal("closed"),
      ),
    ),
    assignedTo: v.optional(v.id("users")),
    priority: v.optional(
      v.union(
        v.literal("low"),
        v.literal("medium"),
        v.literal("high"),
        v.literal("urgent"),
      ),
    ),
    description: v.optional(v.string()),
    title: v.optional(v.string()),
    updatedBy: v.id("users"),
  },
  handler: async (
    ctx,
    { ticketId, status, assignedTo, priority, updatedBy, title, description },
  ) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) throw new Error("Ticket not found");

    const updates = { updatedAt: Date.now() };

    if (status !== undefined) updates.status = status;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (priority !== undefined) updates.priority = priority;
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;

    await ctx.db.patch(ticketId, updates);

    if (status && status !== ticket.status) {
      await ctx.db.insert("notifications", {
        userId: ticket.userId,
        type: "ticket_status_changed",
        title: "Ticket Status Updated",
        message: `Your ticket ${ticket.title} status has changed to ${status}`,
        ticketId,
        fromUserId: updatedBy,
        read: false,
        createdAt: Date.now(),
      });
    }

    if (assignedTo && assignedTo !== ticket.assignedTo) {
      await ctx.db.insert("notifications", {
        userId: assignedTo,
        type: "ticket_assigned",
        title: "Ticket Assigned",
        message: `You have been assigned to ticket: ${ticket.title}`,
        ticketId,
        fromUserId: updatedBy,
        read: false,
        createdAt: Date.now(),
      });
    }
  },
});

export const deleteTicket = mutation({
  args: { ticketId: v.id("tickets") },
  handler: async (ctx, { ticketId }) => {
    const ticket = await ctx.db.get(ticketId);
    if (!ticket) throw new Error("Ticket not found");

    const attachments = await ctx.db
      .query("attachments")
      .withIndex("by_ticket", (q) => q.eq("ticketId", ticketId))
      .collect();

    for (const att of attachments) {
      await ctx.db.delete(att._id);
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_ticket", (q) => q.eq("ticketId", ticketId))
      .collect();

    for (const notif of notifications) {
      await ctx.db.delete(notif._id);
    }

    await ctx.db.delete(ticketId);

    return { success: true };
  },
});
