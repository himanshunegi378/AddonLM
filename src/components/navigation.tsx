"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { MessageSquare, Bot, Settings, LogOut, User, Menu, X } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

export function MainNav() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/chat",
      label: "Chat",
      icon: <MessageSquare className="h-4 w-4 mr-2" />,
      active: pathname === "/chat" || pathname.startsWith("/chat/"),
      protected: true,
    },
    {
      href: "/chatbot",
      label: "Chatbots",
      icon: <Bot className="h-4 w-4 mr-2" />,
      active: pathname === "/chatbot" || pathname.startsWith("/chatbot/"),
      protected: true,
    },
    {
      href: "/plugin",
      label: "Plugins",
      icon: <Settings className="h-4 w-4 mr-2" />,
      active: pathname === "/plugin" || pathname.startsWith("/plugin/"),
      protected: true,
    },
  ];

  // Filter routes based on authentication status
  const filteredRoutes = routes.filter(
    (route) => !route.protected || isAuthenticated
  );

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 py-2 px-4 sm:px-6 transition-all duration-300 border-b",
      scrolled ? "bg-background/95 backdrop-blur-sm shadow-sm" : "bg-background"
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between w-full h-16">
          {/* Logo/Brand - You can replace this with your actual logo */}
          <Link href="/" className="font-bold text-xl text-primary flex items-center">
            <Bot className="h-6 w-6 mr-2" />
            <span className="hidden sm:inline">AddonAI</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {filteredRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground",
                  route.active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground"
                )}
                aria-current={route.active ? "page" : undefined}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}
          </nav>
          
          {/* Auth & User Section */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full p-0 focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuItem className="flex items-center justify-start">
                    <User className="mr-2 h-4 w-4" />
                    <span className="truncate">{user?.name}</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer flex w-full">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer flex w-full">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logout()}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="shadow-sm hover:shadow-md transition-shadow">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-background pt-16">
          <nav className="flex flex-col p-4 space-y-2">
            {filteredRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center px-4 py-3 rounded-md text-sm font-medium transition-all",
                  route.active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}
            
            {/* Mobile Auth Buttons */}
            {!isAuthenticated && (
              <div className="mt-4 flex flex-col space-y-2 pt-4 border-t">
                <Link href="/auth/login" className="w-full">
                  <Button variant="outline" className="w-full justify-center">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup" className="w-full">
                  <Button className="w-full justify-center">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
