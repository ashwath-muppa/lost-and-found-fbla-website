import React from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function Footer() {
    return (
        <footer className="border-t bg-muted/30" role="contentinfo">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h2 className="font-bold text-lg mb-2">
                            School Lost <span className="text-[hsl(var(--accent))]">&</span> Found
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            Helping students reunite with their belongings. A safe, secure, and
                            accessible platform for our school community.
                        </p>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm mb-3 uppercase tracking-wide">Quick Links</h3>
                        <ul className="space-y-2 text-sm" role="list">
                            <li>
                                <Link href="/browse" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Browse Items
                                </Link>
                            </li>
                            <li>
                                <Link href="/report" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Report an Item
                                </Link>
                            </li>
                            <li>
                                <Link href="/admin" className="text-muted-foreground hover:text-foreground transition-colors">
                                    Admin Dashboard
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-sm mb-3 uppercase tracking-wide">Accessibility</h3>
                        <p className="text-sm text-muted-foreground">
                            This website is built to meet WCAG 2.1 AA accessibility standards.
                            All content is keyboard-navigable, screen-reader compatible, and
                            maintains a minimum 4.5:1 color contrast ratio.
                        </p>
                    </div>
                </div>

                <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} School Lost & Found. Built with{" "}
                        <Heart className="inline h-3 w-3 text-red-500" aria-label="love" /> for FBLA.
                    </p>
                </div>
            </div>
        </footer>
    );
}
