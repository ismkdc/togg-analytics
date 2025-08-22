import { useState, useEffect } from "react";

// Mock user data for development
const mockUser = {
  id: "sample-user-1",
  email: "ahmet.yilmaz@trumore.com",
  firstName: "Ahmet",
  lastName: "Yılmaz",
  profileImageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
};

export function useAuth() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
      setIsAuthenticated(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    user: isAuthenticated ? mockUser : null,
    isLoading,
    isAuthenticated,
  };
}
