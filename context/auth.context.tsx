"use client";
import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

type AuthUser = {
  name: string;
  email: string;
  // Add any other user properties that come from your API
};

interface ProviderProps {
  user: AuthUser | null;
  login(data: AuthUser): void;
  logout(): void;
}

const AuthContext = createContext<ProviderProps>({
  user: null,
  login: () => {},
  logout: () => {},
});

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("storedUser");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });

  const login = (data: AuthUser) => {
    try {
      // console.log("login is called", data);
      if (!data || !data.email) {
        console.error("Invalid user data received:", data);
        return;
      }
      setUser(data);
      localStorage.setItem("storedUser", JSON.stringify(data));
      router.push("/today");
    } catch (error) {
      console.error("Error during login:", error);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("storedUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};
