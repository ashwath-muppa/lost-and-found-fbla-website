"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { MapPin, Calendar, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Item } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ItemCardProps {
    item: Item;
    index?: number;
}

const categoryLabels: Record<string, string> = {
    electronics: "Electronics",
    clothing: "Clothing",
    books: "Books",
    accessories: "Accessories",
    sports: "Sports",
    other: "Other",
};

export default function ItemCard({ item, index = 0 }: ItemCardProps) {
    const isLost = item.type === "lost";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Link href={`/items/${item.id}`} className="block group">
                <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border/50">
                    <div className="relative h-48 bg-muted overflow-hidden">
                        {item.image_url ? (
                            <Image
                                src={item.image_url}
                                alt={`Photo of ${item.title} — ${isLost ? "Lost" : "Found"} ${categoryLabels[item.category] || item.category}`}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            />
                        ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                <Tag className="h-12 w-12 opacity-30" />
                            </div>
                        )}

                        <Badge
                            className={cn(
                                "absolute top-3 left-3 text-xs font-semibold shadow-md",
                                isLost
                                    ? "bg-red-500 hover:bg-red-600 text-white"
                                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                            )}
                        >
                            {isLost ? "LOST" : "FOUND"}
                        </Badge>

                        {item.status === "pending" && (
                            <Badge className="absolute top-3 right-3 text-xs bg-yellow-500 hover:bg-yellow-600 text-white shadow-md">
                                Pending Review
                            </Badge>
                        )}
                    </div>

                    <CardContent className="p-4">
                        <h3 className="font-semibold text-base mb-2 line-clamp-1 group-hover:text-[hsl(var(--accent))] transition-colors">
                            {item.title}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {item.description}
                        </p>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(item.date_occurred).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="mt-3">
                            <Badge variant="secondary" className="text-xs">
                                {categoryLabels[item.category] || item.category}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}
