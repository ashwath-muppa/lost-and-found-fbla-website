"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
    { href: "/", label: "Home" },
    { href: "/browse", label: "Browse Items" },
    { href: "/report", label: "Report Item" },
    { href: "/admin", label: "Admin", icon: Shield },
];

export default function NavBar() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full glass border-b border-border/50">
            <nav
                aria-label="Main navigation"
                className="container mx-auto flex h-16 items-center justify-between px-4"
            >
                <Link
                    href="/"
                    className="flex items-center gap-2 font-bold text-xl hover:opacity-80 transition-opacity"
                    aria-label="School Lost & Found — Home"
                >
                    <span className="bg-primary text-primary-foreground rounded-lg p-1.5 text-sm">
                        L&F
                    </span>
                    <span className="hidden sm:inline text-primary">
                        Lost <span className="text-[hsl(var(--accent))]">&</span> Found
                    </span>
                </Link>

                <ul className="hidden md:flex items-center gap-1" role="list">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={cn(
                                        "flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    {link.icon && <link.icon className="h-4 w-4" />}
                                    {link.label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>

                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-expanded={mobileMenuOpen}
                    aria-controls="mobile-menu"
                    aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </nav>

            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        id="mobile-menu"
                        role="navigation"
                        aria-label="Mobile navigation"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden overflow-hidden border-t border-border/50"
                    >
                        <ul className="container mx-auto px-4 py-3 space-y-1" role="list">
                            {navLinks.map((link) => {
                                const isActive = pathname === link.href;
                                return (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                                isActive
                                                    ? "bg-primary text-primary-foreground"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            )}
                                            aria-current={isActive ? "page" : undefined}
                                        >
                                            {link.icon && <link.icon className="h-4 w-4" />}
                                            {link.label}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
