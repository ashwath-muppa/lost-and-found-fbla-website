/**
 * Browse Page — Grid view of all lost/found items with filtering & search.
 * 
 * Features:
 * - Fuzzy search using Fuse.js (searches title + description simultaneously)
 * - Multi-criteria filtering (status, category, date range)
 * - Responsive grid layout
 * - Empty state and loading skeletons
 * 
 * Why Fuse.js? Traditional SQL LIKE queries can't handle typos or partial
 * matches. Fuse.js uses a weighted scoring algorithm that finds "close enough"
 * matches, which is critical for a lost & found app where users might
 * misspell item names.
 */

"use client";

import React, { useEffect, useState, useMemo } from "react";
import Fuse from "fuse.js";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import ItemCard from "@/components/ItemCard";
import { getItems } from "@/lib/actions";
import { Item, CATEGORIES, ItemType, ItemCategory } from "@/lib/types";

export default function BrowsePage() {
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<ItemType | "all">("all");
    const [filterCategory, setFilterCategory] = useState<ItemCategory | "all">("all");
    const [showFilters, setShowFilters] = useState(false);

    // Fetch items on component mount
    useEffect(() => {
        async function fetchItems() {
            try {
                const data = await getItems({ status: "approved" });
                setItems(data);
            } catch (error) {
                console.error("Error fetching items:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchItems();
    }, []);

    /**
     * Fuse.js configuration for fuzzy search.
     * We search both title and description, with title weighted higher
     * because it's more likely what users are searching for.
     * The threshold of 0.4 allows some fuzziness without too many false positives.
     */
    const fuse = useMemo(
        () =>
            new Fuse(items, {
                keys: [
                    { name: "title", weight: 0.7 },
                    { name: "description", weight: 0.3 },
                ],
                threshold: 0.4,
                includeScore: true,
            }),
        [items]
    );

    /**
     * Applies both fuzzy search and hard filters.
     * Search narrows by relevance, filters narrow by exact match.
     */
    const filteredItems = useMemo(() => {
        let result = items;

        // Apply fuzzy search if there's a query
        if (searchQuery.trim()) {
            result = fuse.search(searchQuery).map((r) => r.item);
        }

        // Apply type filter
        if (filterType !== "all") {
            result = result.filter((item) => item.type === filterType);
        }

        // Apply category filter
        if (filterCategory !== "all") {
            result = result.filter((item) => item.category === filterCategory);
        }

        return result;
    }, [items, searchQuery, filterType, filterCategory, fuse]);

    const activeFilterCount = [filterType !== "all", filterCategory !== "all"].filter(Boolean).length;

    const clearFilters = () => {
        setFilterType("all");
        setFilterCategory("all");
        setSearchQuery("");
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Browse Items</h1>
                <p className="text-muted-foreground">
                    Search through all reported lost and found items
                </p>
            </motion.div>

            {/* Search & Filter Bar */}
            <div className="mb-6 space-y-4">
                <div className="flex gap-3">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by title or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                            aria-label="Search items"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label="Clear search"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Filter Toggle */}
                    <Button
                        variant={showFilters ? "default" : "outline"}
                        onClick={() => setShowFilters(!showFilters)}
                        className="gap-2"
                        aria-expanded={showFilters}
                        aria-controls="filter-panel"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <motion.div
                        id="filter-panel"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-muted/50 rounded-xl border"
                    >
                        <div className="flex flex-wrap gap-6">
                            {/* Type Filter */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Status</Label>
                                <div className="flex gap-2">
                                    {[
                                        { value: "all", label: "All" },
                                        { value: "lost", label: "Lost" },
                                        { value: "found", label: "Found" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.value}
                                            onClick={() => setFilterType(opt.value as ItemType | "all")}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                                                filterType === opt.value
                                                    ? opt.value === "lost"
                                                        ? "bg-red-500 text-white border-red-500"
                                                        : opt.value === "found"
                                                            ? "bg-emerald-500 text-white border-emerald-500"
                                                            : "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background border-border hover:border-primary/50"
                                            )}
                                            aria-pressed={filterType === opt.value}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Category</Label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setFilterCategory("all")}
                                        className={cn(
                                            "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                                            filterCategory === "all"
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background border-border hover:border-primary/50"
                                        )}
                                        aria-pressed={filterCategory === "all"}
                                    >
                                        All
                                    </button>
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.value}
                                            onClick={() => setFilterCategory(cat.value)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                                                filterCategory === cat.value
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background border-border hover:border-primary/50"
                                            )}
                                            aria-pressed={filterCategory === cat.value}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {activeFilterCount > 0 && (
                                <div className="flex items-end">
                                    <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                                        <X className="h-3 w-3 mr-1" /> Clear All
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {/* Results count */}
                <p className="text-sm text-muted-foreground">
                    Showing {filteredItems.length} of {items.length} items
                    {searchQuery && ` matching "${searchQuery}"`}
                </p>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Card key={i} className="h-80 animate-pulse bg-muted" />
                    ))}
                </div>
            ) : filteredItems.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredItems.map((item, index) => (
                        <ItemCard key={item.id} item={item} index={index} />
                    ))}
                </div>
            ) : (
                <Card className="p-16 text-center">
                    <CardContent>
                        <Package className="mx-auto h-16 w-16 text-muted-foreground/30 mb-6" />
                        <h3 className="font-semibold text-lg mb-2">No items found</h3>
                        <p className="text-muted-foreground mb-4">
                            {searchQuery
                                ? `No items match "${searchQuery}". Try adjusting your search or filters.`
                                : "No items have been reported yet. Be the first to report one!"}
                        </p>
                        <Button variant="outline" onClick={clearFilters}>
                            Clear Filters
                        </Button>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
