import { useUser } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export const useCurrentUser = () => {
  const { user, isLoaded: clerkLoaded } = useUser();

  const convexUser = useQuery(
    api.users.getCurrentUser,
    user ? { clerkId: user.id } : "skip",
  );

  if (!clerkLoaded) {
    return {
      currentUser: null,
      isLoading: true,
      isAdmin: false,
      clerkUser: null,
    };
  }

  if (!user) {
    return {
      currentUser: null,
      isLoading: false,
      isAdmin: false,
      clerkUser: null,
    };
  }

  if (convexUser === undefined) {
    return {
      currentUser: null,
      isLoading: true,
      isAdmin: false,
      clerkUser: user,
    };
  }

  return {
    currentUser: convexUser,
    isLoading: false,
    isAdmin: convexUser?.role === "admin",
    clerkUser: user,
  };
};
