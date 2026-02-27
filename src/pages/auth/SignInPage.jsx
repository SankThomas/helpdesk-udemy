import { SignIn } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../../layouts/AuthLayout";

export const SignInPage = () => {
  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your account to continue"
    >
      <div className="space-y-6">
        <SignIn />

        <p className="text-center text-sm text-gray-600">
          Don't have an account? &nbsp;
          <Link
            to="/sign-up"
            className="text-primary-600 hover:text-primary-500 font-medium transition-colors"
          >
            Sign up here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
