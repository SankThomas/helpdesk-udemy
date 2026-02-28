import { useCurrentUser } from "../../hooks/useCurrentUser";
import { LoadingSpinner } from "../../components/ui/LoadingSpinner";
import { AdminDashboard } from "../../components/dashboard/AdminDashboard";
import { AgentDashboard } from "../../components/dashboard/AgentDashboard";
import { UserDashboard } from "../../components/dashboard/UserDashboard";

export const DashboardPage = () => {
  const { currentUser } = useCurrentUser();

  if (!currentUser) {
    return <LoadingSpinner />;
  }

  switch (currentUser.role) {
    case "admin":
      return <AdminDashboard user={currentUser} />;
    case "agent":
      return <AgentDashboard user={currentUser} />;
    case "user":
      return <UserDashboard user={currentUser} />;
  }
};
