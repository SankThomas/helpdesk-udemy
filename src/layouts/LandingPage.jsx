import { useCurrentUser } from "../hooks/useCurrentUser";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export const LandingPage = () => {
  const { currentUser } = useCurrentUser();
  const { user } = useUser();

  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    if (user && !currentUser) {
      createUser({
        clerkId: user.id,
        email: user.primaryEmailAddress?.emailAddress || "",
        name: user.fullName || user.firstName || "User",
        role: "user",
      });
    }
  }, [user, currentUser, createUser]);

  return (
    <div className="bg-white">
      <header className="fixed flex w-full items-center justify-between p-4">
        <h2 className="text-2xl font-bold">Helpdesk</h2>

        <nav>
          <ul className="flex items-center justify-center gap-4">
            <li>
              {currentUser ? (
                <Link to="/dashboard">
                  <Button>Your dashboard</Button>
                </Link>
              ) : (
                <Link to="/sign-in">
                  <Button>Sign in or Create an Account</Button>
                </Link>
              )}
            </li>
          </ul>
        </nav>
      </header>

      <main className="mx-auto flex h-screen max-w-4xl items-center justify-center text-center">
        <article className="space-y-6">
          <h1 className="text-4xl! lg:text-6xl!">Helpdesk</h1>
          <p className="text-lg! text-gray-500 lg:text-xl!">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quo itaque
            dolore beatae facilis nulla repellat, ullam harum accusamus tempora
            magnam?
          </p>

          <ul className="flex items-center justify-center gap-4">
            <li>
              {currentUser ? (
                <Link to="/dashboard">
                  <Button>Your dashboard</Button>
                </Link>
              ) : (
                <Link to="/sign-in">
                  <Button>Sign in or Create an Account</Button>
                </Link>
              )}
            </li>
          </ul>
        </article>
      </main>
    </div>
  );
};
