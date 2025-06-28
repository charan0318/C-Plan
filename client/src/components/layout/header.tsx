import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/wallet/wallet-connect";
import { Brain, Sun, Moon } from "lucide-react";

export default function Header() {
  const [location] = useLocation();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Brain className="text-white text-sm" size={16} />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">C-PLAN</span>
            </Link>
            <nav className="hidden md:flex space-x-6">
              <Link href="/">
                <span className={`font-medium transition-colors ${
                  isActive("/") 
                    ? "text-primary border-b-2 border-primary pb-1" 
                    : "text-gray-600 dark:text-gray-300 hover:text-primary"
                }`}>
                  Home
                </span>
              </Link>
              <Link href="/planner">
                <span className={`font-medium transition-colors ${
                  isActive("/planner") 
                    ? "text-primary border-b-2 border-primary pb-1" 
                    : "text-gray-600 dark:text-gray-300 hover:text-primary"
                }`}>
                  Planner
                </span>
              </Link>
              <Link href="/dashboard">
                <span className={`font-medium transition-colors ${
                  isActive("/dashboard") 
                    ? "text-primary border-b-2 border-primary pb-1" 
                    : "text-gray-600 dark:text-gray-300 hover:text-primary"
                }`}>
                  Dashboard
                </span>
              </Link>
              <Link href="/settings">
                <span className={`font-medium transition-colors ${
                  isActive("/settings") 
                    ? "text-primary border-b-2 border-primary pb-1" 
                    : "text-gray-600 dark:text-gray-300 hover:text-primary"
                }`}>
                  Settings
                </span>
              </Link>
            </nav>
          </div>

          {/* Theme Toggle and Wallet Connection */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hidden sm:flex"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </Button>
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  );
}