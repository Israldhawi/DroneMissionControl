import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

import type { AuthUser } from "../types/auth";
import { login as apiLogin } from "../services/api";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext =
  createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("auth_user");

    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      localStorage.removeItem("auth_user");
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("auth_token"),
  );

  async function login(
    email: string,
    password: string,
  ) {
    const data = await apiLogin(email, password);

    setUser(data.user);
    setToken(data.token);

    localStorage.setItem(
      "auth_user",
      JSON.stringify(data.user),
    );

    localStorage.setItem(
      "auth_token",
      data.token,
    );
  }

  function logout() {
    setUser(null);
    setToken(null);

    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}
