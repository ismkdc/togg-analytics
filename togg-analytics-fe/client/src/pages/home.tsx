import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect authenticated users to vehicles page
    setLocation("/vehicles");
  }, [setLocation]);

  return null;
}
