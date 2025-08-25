import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/components/ui/use-toast";
import backend from "~backend/client";
import type { User } from "~backend/user/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  userType: "student" | "professor" | "admin";
  studentId?: string;
  department?: string;
  phone?: string;
  address?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in on app start
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // For demo purposes, we'll find a user by email
      // In a real app, this would be handled by a proper authentication endpoint
      const usersResponse = await backend.user.list({});
      const foundUser = usersResponse.users.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }

      setUser(foundUser);
      localStorage.setItem("user", JSON.stringify(foundUser));
      toast({ title: "Login successful" });
    } catch (error) {
      console.error("Login error:", error);
      toast({ 
        title: "Login failed", 
        description: "Invalid email or password",
        variant: "destructive" 
      });
      throw error;
    }
  };

  const signup = async (userData: SignupData) => {
    try {
      const newUser = await backend.user.create({
        name: userData.name,
        email: userData.email,
        userType: userData.userType,
        studentId: userData.studentId,
        department: userData.department,
        phone: userData.phone,
        address: userData.address,
      });

      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
      toast({ title: "Account created successfully" });
    } catch (error) {
      console.error("Signup error:", error);
      toast({ 
        title: "Signup failed", 
        description: "Failed to create account",
        variant: "destructive" 
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({ title: "Logged out successfully" });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
