import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import AnimatedLogo from "../components/AnimatedLogo";

import { AuthContext } from "../contexts/AuthContext";
import useApiRequest from "../hooks/useApiRequest";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const { mutate: loginMutate, isLoading: isLoggingIn } = useApiRequest({
    url: "/api/auth/login",
    method: "POST",
    requiresAuth: false,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    loginMutate(
      { username, password },
      {
        onSuccess: (data) => {
          login(data.token, data.user, data.expires_at);
          navigate("/");
        },
        onError: (err) => {
          const msg = err.response?.data?.message || "Invalid username or password";
          setError(msg);
        },
      }
    );
  };

  return (
    <div className="w-full max-w-md space-y-8">
      <div>
        <AnimatedLogo />
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
      </div>
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="-space-y-px rounded-md shadow-sm">
          <div>
            <label htmlFor="username" className="sr-only">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Username"
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isLoggingIn ? "Signing in..." : "Sign in"}
          </button>
        </div>

        <div className="text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign up
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Login;
