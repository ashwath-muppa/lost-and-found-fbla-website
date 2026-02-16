"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HandHelping, AlertTriangle, ArrowRight, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getRecentItems, getAnalytics } from "@/lib/actions";
import { Item } from "@/lib/types";
import ItemCard from "@/components/ItemCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    lostItems: 0,
    foundItems: 0,
    returnedItems: 0,
    pendingItems: 0,
    totalClaims: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [items, analytics] = await Promise.all([
          getRecentItems(6),
          getAnalytics(),
        ]);
        setRecentItems(items);
        setStats(analytics);
      } catch (error) {
        console.error("Error loading homepage data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary/90">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[hsl(var(--accent))] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge className="mb-6 bg-[hsl(var(--accent))]/20 text-[hsl(var(--accent))] border-[hsl(var(--accent))]/30 hover:bg-[hsl(var(--accent))]/30">
              <Package className="mr-1 h-3 w-3" />
              School Lost & Found Platform
            </Badge>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Lost Something?{" "}
              <span className="text-[hsl(var(--accent))]">Found Something?</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 mb-12 max-w-2xl mx-auto">
              Our secure platform helps students and staff report lost items, browse found
              belongings, and reunite with their possessions — quickly and safely.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto"
            >
              <Link href="/report?type=lost" className="flex-1">
                <Button
                  size="lg"
                  className="w-full h-16 text-lg font-semibold bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  <AlertTriangle className="mr-2 h-6 w-6" />
                  I Lost Something
                </Button>
              </Link>

              <Link href="/report?type=found" className="flex-1">
                <Button
                  size="lg"
                  className="w-full h-16 text-lg font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  <HandHelping className="mr-2 h-6 w-6" />
                  I Found Something
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 120L60 110C120 100 240 80 360 73.3C480 67 600 73 720 80C840 87 960 93 1080 90C1200 87 1320 73 1380 66.7L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      <section className="container mx-auto px-4 -mt-6 relative z-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { icon: Package, label: "Total Items", value: stats.totalItems, color: "text-blue-500" },
            { icon: AlertTriangle, label: "Lost Items", value: stats.lostItems, color: "text-red-500" },
            { icon: HandHelping, label: "Found Items", value: stats.foundItems, color: "text-emerald-500" },
            { icon: CheckCircle2, label: "Returned", value: stats.returnedItems, color: "text-[hsl(var(--accent))]" },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card className="border-border/50 shadow-sm">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className={`${stat.color}`}>
                    <stat.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to report and recover your belongings
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
        >
          {[
            {
              step: "1",
              title: "Report",
              description: "Fill out a quick form describing what you lost or found, including photos and location details.",
              icon: "📝",
            },
            {
              step: "2",
              title: "Browse & Match",
              description: "Search through reported items using filters and fuzzy search to find potential matches.",
              icon: "🔍",
            },
            {
              step: "3",
              title: "Claim & Recover",
              description: "Verify ownership with a security question and connect with the finder to get your item back.",
              icon: "🎉",
            },
          ].map((item) => (
            <motion.div key={item.step} variants={itemVariants}>
              <Card className="text-center p-6 border-border/50 hover:shadow-md transition-shadow h-full">
                <CardContent className="pt-6">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">Recent Activity</h2>
              <p className="text-muted-foreground">Latest items reported by the school community</p>
            </div>
            <Link href="/browse">
              <Button variant="outline" className="hidden md:flex">
                View All Items <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-80 animate-pulse bg-muted" />
              ))}
            </div>
          ) : recentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentItems.map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CardContent>
                <Package className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">No items reported yet. Be the first!</p>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 text-center md:hidden">
            <Link href="/browse">
              <Button variant="outline">
                View All Items <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-center text-white"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Report an Item?
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Whether you lost something or found an item, reporting it takes less than 2 minutes.
          </p>
          <Link href="/report">
            <Button
              size="lg"
              className="bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-foreground font-semibold text-lg px-8"
            >
              Report Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </motion.div>
      </section>
    </div>
  );
}
