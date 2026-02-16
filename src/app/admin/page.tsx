"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts";
import {
    Shield,
    LogOut,
    Loader2,
    Check,
    X,
    Trash2,
    RotateCcw,
    Package,

    AlertTriangle,
    HandHelping,
    CheckCircle2,
    Clock,
    TrendingUp,
    Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    getAllItems,
    getAllClaims,
    updateItemStatus,
    deleteItem,
    updateClaimStatus,
    getAnalytics,
} from "@/lib/actions";
import { Item, Claim } from "@/lib/types";

const MOCK_ADMIN = { username: "admin", password: "admin123" };

const CHART_COLORS = ["#ef4444", "#22c55e", "#3b82f6", "#f59e0b"];

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginError, setLoginError] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    useEffect(() => {
        const session = sessionStorage.getItem("admin_session");
        if (session === "true") {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === MOCK_ADMIN.username && password === MOCK_ADMIN.password) {
            sessionStorage.setItem("admin_session", "true");
            setIsAuthenticated(true);
            setLoginError("");
        } else {
            setLoginError("Invalid credentials. Try admin / admin123");
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem("admin_session");
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="w-full max-w-md shadow-xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <Shield className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
                            <CardDescription>
                                Sign in with your administrator credentials
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="admin-username">Username</Label>
                                    <Input
                                        id="admin-username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="Enter username"
                                        autoComplete="username"
                                        aria-describedby={loginError ? "login-error" : undefined}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="admin-password">Password</Label>
                                    <Input
                                        id="admin-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter password"
                                        autoComplete="current-password"
                                        aria-describedby={loginError ? "login-error" : undefined}
                                    />
                                </div>
                                {loginError && (
                                    <p id="login-error" className="text-sm text-destructive" role="alert">
                                        {loginError}
                                    </p>
                                )}
                                <Button type="submit" className="w-full">
                                    <Shield className="mr-2 h-4 w-4" /> Sign In
                                </Button>
                            </form>

                            <div className="mt-4 p-3 bg-muted rounded-lg">
                                <p className="text-xs text-muted-foreground text-center">
                                    Demo credentials: <code className="font-mono">admin</code> / <code className="font-mono">admin123</code>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return <AdminDashboard onLogout={handleLogout} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
    const [items, setItems] = useState<Item[]>([]);
    const [claims, setClaims] = useState<Claim[]>([]);
    const [analytics, setAnalytics] = useState({
        totalItems: 0,
        lostItems: 0,
        foundItems: 0,
        returnedItems: 0,
        pendingItems: 0,
        totalClaims: 0,
    });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [itemsData, claimsData, analyticsData] = await Promise.all([
                getAllItems(),
                getAllClaims(),
                getAnalytics(),
            ]);
            setItems(itemsData);
            setClaims(claimsData);
            setAnalytics(analyticsData);
        } catch (error) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (id: string) => {
        setActionLoading(id);
        await updateItemStatus(id, "approved");
        await fetchData();
        setActionLoading(null);
    };

    const handleReturn = async (id: string) => {
        setActionLoading(id);
        await updateItemStatus(id, "returned");
        await fetchData();
        setActionLoading(null);
    };

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this item? This cannot be undone.")) {
            setActionLoading(id);
            await deleteItem(id);
            await fetchData();
            setActionLoading(null);
        }
    };

    const handleClaimAction = async (id: string, status: "approved" | "denied") => {
        setActionLoading(id);
        await updateClaimStatus(id, status);
        await fetchData();
        setActionLoading(null);
    };

    const barChartData = [
        { name: "Lost", count: analytics.lostItems, fill: "#ef4444" },
        { name: "Found", count: analytics.foundItems, fill: "#22c55e" },
        { name: "Returned", count: analytics.returnedItems, fill: "#3b82f6" },
        { name: "Pending", count: analytics.pendingItems, fill: "#f59e0b" },
    ];

    const pieChartData = [
        { name: "Lost", value: analytics.lostItems },
        { name: "Found", value: analytics.foundItems },
        { name: "Returned", value: analytics.returnedItems },
    ];

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Loading dashboard data...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage items, review claims, and view analytics</p>
                </motion.div>
                <Button variant="outline" onClick={onLogout} className="gap-2">
                    <LogOut className="h-4 w-4" /> Sign Out
                </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { icon: Package, label: "Total Items", value: analytics.totalItems, color: "text-blue-500" },
                    { icon: Clock, label: "Pending Review", value: analytics.pendingItems, color: "text-yellow-500" },
                    { icon: CheckCircle2, label: "Returned", value: analytics.returnedItems, color: "text-emerald-500" },
                    { icon: Users, label: "Total Claims", value: analytics.totalClaims, color: "text-purple-500" },
                ].map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="flex items-center gap-3 p-4">
                            <stat.icon className={`h-8 w-8 ${stat.color}`} />
                            <div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="items" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="items" className="gap-2">
                        <Package className="h-4 w-4" /> Items ({items.length})
                    </TabsTrigger>
                    <TabsTrigger value="claims" className="gap-2">
                        <Users className="h-4 w-4" /> Claims ({claims.length})
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="gap-2">
                        <TrendingUp className="h-4 w-4" /> Analytics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="items">
                    <Card>
                        <CardHeader>
                            <CardTitle>All Items</CardTitle>
                            <CardDescription>Manage reported lost and found items</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {items.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No items to display</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Type</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead>Location</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium max-w-[200px] truncate">
                                                        {item.title}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                item.type === "lost"
                                                                    ? "bg-red-100 text-red-700 hover:bg-red-100"
                                                                    : "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                                            }
                                                        >
                                                            {item.type === "lost" ? (
                                                                <><AlertTriangle className="mr-1 h-3 w-3" />Lost</>
                                                            ) : (
                                                                <><HandHelping className="mr-1 h-3 w-3" />Found</>
                                                            )}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="capitalize">{item.category}</TableCell>
                                                    <TableCell>{item.location}</TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            variant={
                                                                item.status === "approved"
                                                                    ? "default"
                                                                    : item.status === "returned"
                                                                        ? "secondary"
                                                                        : "outline"
                                                            }
                                                            className={
                                                                item.status === "pending"
                                                                    ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                                                    : item.status === "returned"
                                                                        ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                                                                        : ""
                                                            }
                                                        >
                                                            {item.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(item.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-1">
                                                            {item.status === "pending" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleApprove(item.id)}
                                                                    disabled={actionLoading === item.id}
                                                                    title="Approve"
                                                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                >
                                                                    {actionLoading === item.id ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : (
                                                                        <Check className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            )}
                                                            {item.status === "approved" && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleReturn(item.id)}
                                                                    disabled={actionLoading === item.id}
                                                                    title="Mark as Returned"
                                                                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                                >
                                                                    <RotateCcw className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                onClick={() => handleDelete(item.id)}
                                                                disabled={actionLoading === item.id}
                                                                title="Delete"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="claims">
                    <Card>
                        <CardHeader>
                            <CardTitle>Claim Requests</CardTitle>
                            <CardDescription>Review and manage item claim attempts</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {claims.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">No claims to review</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Item</TableHead>
                                                <TableHead>Claimant</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead>Security Answer</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Date</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {claims.map((claim) => (
                                                <TableRow key={claim.id}>
                                                    <TableCell className="font-medium max-w-[150px] truncate">
                                                        {claim.item?.title || "Unknown Item"}
                                                    </TableCell>
                                                    <TableCell>{claim.claimant_name}</TableCell>
                                                    <TableCell className="text-sm">{claim.claimant_email}</TableCell>
                                                    <TableCell className="text-sm max-w-[200px] truncate" title={claim.security_answer}>
                                                        {claim.security_answer}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                claim.status === "approved"
                                                                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                                                    : claim.status === "denied"
                                                                        ? "bg-red-100 text-red-700 hover:bg-red-100"
                                                                        : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                                                            }
                                                        >
                                                            {claim.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground">
                                                        {new Date(claim.created_at).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        {claim.status === "pending" && (
                                                            <div className="flex justify-end gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleClaimAction(claim.id, "approved")}
                                                                    disabled={actionLoading === claim.id}
                                                                    title="Approve Claim"
                                                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                >
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => handleClaimAction(claim.id, "denied")}
                                                                    disabled={actionLoading === claim.id}
                                                                    title="Deny Claim"
                                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="analytics">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" /> Items Overview
                                </CardTitle>
                                <CardDescription>
                                    Distribution of items by current status
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barChartData}>
                                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                                            <XAxis dataKey="name" className="text-xs" />
                                            <YAxis allowDecimals={false} className="text-xs" />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "hsl(var(--card))",
                                                    border: "1px solid hsl(var(--border))",
                                                    borderRadius: "8px",
                                                }}
                                            />
                                            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                                {barChartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" /> Item Distribution
                                </CardTitle>
                                <CardDescription>
                                    Proportional breakdown of all items
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieChartData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                label={({ name, percent }: any) =>
                                                    `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                                                }
                                            >
                                                {pieChartData.map((_, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
