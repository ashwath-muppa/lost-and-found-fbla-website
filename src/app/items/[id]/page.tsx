/**
 * Item Detail Page — Dynamic route for individual item details.
 * 
 * This page uses Next.js dynamic routing ([id]) to create a unique URL
 * for every item. This is important for shareability — users can copy
 * and share the link to a specific item.
 * 
 * The claim flow is handled by the ClaimModal component, which includes
 * a security question to prevent unauthorized claims.
 */

"use client";

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    MapPin,
    Calendar,
    Clock,
    Tag,
    Mail,
    AlertTriangle,
    HandHelping,
    CheckCircle2,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ClaimModal from "@/components/ClaimModal";
import { getItemById } from "@/lib/actions";
import { Item } from "@/lib/types";

/** Maps category slugs to readable labels */
const categoryLabels: Record<string, string> = {
    electronics: "Electronics",
    clothing: "Clothing",
    books: "Books & Notebooks",
    accessories: "Accessories",
    sports: "Sports Equipment",
    other: "Other",
};

/**
 * Obfuscates an email address for privacy protection.
 * Example: "john.doe@school.edu" → "j*****e@school.edu"
 * 
 * This is a simple technique to show contact info exists without
 * exposing the full address to prevent spam/phishing.
 */
function obfuscateEmail(email: string): string {
    const [local, domain] = email.split("@");
    if (local.length <= 2) return `${local[0]}*@${domain}`;
    return `${local[0]}${"*".repeat(local.length - 2)}${local[local.length - 1]}@${domain}`;
}

export default function ItemDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const isNewlyCreated = searchParams.get("new") === "true";

    useEffect(() => {
        async function fetchItem() {
            if (params.id) {
                const data = await getItemById(params.id as string);
                setItem(data);
            }
            setLoading(false);
        }
        fetchItem();
    }, [params.id]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Loading item details...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
                <p className="text-muted-foreground mb-6">
                    This item may have been removed or the link is incorrect.
                </p>
                <Link href="/browse">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Browse
                    </Button>
                </Link>
            </div>
        );
    }

    const isLost = item.type === "lost";

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            {/* Back Link */}
            <Link href="/browse" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ArrowLeft className="mr-1 h-4 w-4" /> Back to all items
            </Link>

            {/* Success Banner (shown after new report submission) */}
            {isNewlyCreated && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3"
                >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                    <div>
                        <p className="font-medium text-emerald-800">Report submitted successfully!</p>
                        <p className="text-sm text-emerald-600">
                            An administrator will review and approve your item shortly.
                        </p>
                    </div>
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column — Image */}
                    <div>
                        <div className="relative aspect-square rounded-2xl overflow-hidden bg-muted border">
                            {item.image_url ? (
                                <Image
                                    src={item.image_url}
                                    alt={`Photo of ${item.title} — ${isLost ? "Lost" : "Found"} item in the ${item.category} category`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <Tag className="h-24 w-24 text-muted-foreground/20" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column — Details */}
                    <div className="space-y-6">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-2">
                            <Badge
                                className={
                                    isLost
                                        ? "bg-red-500 hover:bg-red-600 text-white"
                                        : "bg-emerald-500 hover:bg-emerald-600 text-white"
                                }
                            >
                                {isLost ? (
                                    <><AlertTriangle className="mr-1 h-3 w-3" /> LOST</>
                                ) : (
                                    <><HandHelping className="mr-1 h-3 w-3" /> FOUND</>
                                )}
                            </Badge>
                            <Badge variant="secondary">
                                {categoryLabels[item.category] || item.category}
                            </Badge>
                            {item.status === "pending" && (
                                <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                                    Pending Review
                                </Badge>
                            )}
                            {item.status === "returned" && (
                                <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                                    <CheckCircle2 className="mr-1 h-3 w-3" /> Returned
                                </Badge>
                            )}
                        </div>

                        {/* Title & Description */}
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold mb-3">{item.title}</h1>
                            <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>

                        <Separator />

                        {/* Metadata Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Location</p>
                                    <p className="font-medium">{item.location}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Date</p>
                                    <p className="font-medium">{new Date(item.date_occurred).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Time</p>
                                    <p className="font-medium">{item.time_occurred}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Mail className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Contact</p>
                                    <p className="font-medium">{obfuscateEmail(item.contact_email)}</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Reported Date */}
                        <p className="text-xs text-muted-foreground">
                            Reported on {new Date(item.created_at).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })}
                        </p>

                        {/* Claim Button */}
                        {item.status === "approved" && (
                            <ClaimModal itemId={item.id} itemTitle={item.title} />
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
