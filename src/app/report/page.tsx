/**
 * Report Page — Multi-step form wizard for reporting lost/found items.
 * 
 * This is the most complex page in the application. It uses a 4-step wizard
 * pattern because asking for all information at once would overwhelm users.
 * Each step validates independently using Zod, and the form state persists
 * across steps using React Hook Form's built-in state management.
 * 
 * The wizard reads the `type` query parameter from the URL to pre-select
 * "Lost" or "Found" when coming from the homepage CTA buttons.
 */

"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import {
    Check,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Package,
    MapPin,
    Camera,
    Mail,
    AlertTriangle,
    HandHelping,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import FileUpload from "@/components/FileUpload";
import { CATEGORIES, LOCATIONS, fullReportSchema, ReportFormData } from "@/lib/types";
import { createItem, uploadImage } from "@/lib/actions";

const STEPS = [
    { title: "Item Details", description: "What did you lose or find?", icon: Package },
    { title: "When & Where", description: "Help us narrow down the search", icon: MapPin },
    { title: "Add a Photo", description: "A picture helps with identification", icon: Camera },
    { title: "Contact & Security", description: "How can we reach you?", icon: Mail },
];

function ReportFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        trigger,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ReportFormData>({
        resolver: zodResolver(fullReportSchema),
        defaultValues: {
            type: (searchParams.get("type") as "lost" | "found") || undefined,
            category: undefined,
            title: "",
            description: "",
            date_occurred: "",
            time_occurred: "",
            location: "",
            contact_email: "",
            security_answer: "",
        },
    });

    const watchType = watch("type");
    const watchCategory = watch("category");

    /**
     * Validates the current step before allowing navigation to the next.
     * This per-step validation provides immediate feedback without waiting
     * for the final submit, improving the user experience.
     */
    const validateStep = async (): Promise<boolean> => {
        const fieldsPerStep: (keyof ReportFormData)[][] = [
            ["type", "category", "title"],
            ["date_occurred", "time_occurred", "location", "description"],
            [], // Photo step — no required fields
            ["contact_email", "security_answer"],
        ];
        return trigger(fieldsPerStep[currentStep]);
    };

    const handleNext = async () => {
        const isValid = await validateStep();
        if (isValid) setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    };

    const handleBack = () => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    };

    const onSubmit = async (data: ReportFormData) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Upload image first if one was selected
            let imageUrl: string | null = null;
            if (selectedFile) {
                imageUrl = await uploadImage(selectedFile);
            }

            // Create the item in the database
            const item = await createItem(data, imageUrl);

            if (item) {
                router.push(`/items/${item.id}?new=true`);
            } else {
                setSubmitError("Failed to submit your report. Please try again.");
            }
        } catch {
            setSubmitError("An unexpected error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Report an Item</h1>
                <p className="text-muted-foreground">
                    Fill out the form below to report a lost or found item. It takes less than 2 minutes.
                </p>
            </motion.div>

            {/* Step Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    {/* Connection line behind the steps */}
                    <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" aria-hidden="true" />
                    <div
                        className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
                        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                        aria-hidden="true"
                    />

                    {STEPS.map((step, index) => {
                        const isComplete = index < currentStep;
                        const isCurrent = index === currentStep;
                        return (
                            <div key={step.title} className="relative flex flex-col items-center z-10">
                                <div
                                    className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                        isComplete
                                            ? "bg-primary border-primary text-primary-foreground"
                                            : isCurrent
                                                ? "bg-background border-primary text-primary"
                                                : "bg-background border-border text-muted-foreground"
                                    )}
                                    aria-current={isCurrent ? "step" : undefined}
                                >
                                    {isComplete ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        <step.icon className="h-4 w-4" />
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "mt-2 text-xs font-medium hidden sm:block",
                                        isCurrent ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {step.title}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Form Steps */}
            <form onSubmit={handleSubmit(onSubmit)}>
                <Card className="border-border/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>{STEPS[currentStep].title}</CardTitle>
                        <CardDescription>{STEPS[currentStep].description}</CardDescription>
                    </CardHeader>

                    <CardContent>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {/* ── Step 1: Item Details ──────────────────── */}
                                {currentStep === 0 && (
                                    <div className="space-y-6">
                                        {/* Lost vs Found toggle */}
                                        <div className="space-y-2">
                                            <Label>Did you lose or find this item? *</Label>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setValue("type", "lost", { shouldValidate: true })}
                                                    className={cn(
                                                        "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-medium",
                                                        watchType === "lost"
                                                            ? "border-red-500 bg-red-50 text-red-700"
                                                            : "border-border hover:border-red-300"
                                                    )}
                                                    aria-pressed={watchType === "lost"}
                                                >
                                                    <AlertTriangle className="h-5 w-5" />
                                                    I Lost It
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setValue("type", "found", { shouldValidate: true })}
                                                    className={cn(
                                                        "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all font-medium",
                                                        watchType === "found"
                                                            ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                                                            : "border-border hover:border-emerald-300"
                                                    )}
                                                    aria-pressed={watchType === "found"}
                                                >
                                                    <HandHelping className="h-5 w-5" />
                                                    I Found It
                                                </button>
                                            </div>
                                            {errors.type && (
                                                <p className="text-sm text-destructive" role="alert">
                                                    {errors.type.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Category Selection */}
                                        <div className="space-y-2">
                                            <Label>Category *</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                {CATEGORIES.map((cat) => (
                                                    <button
                                                        key={cat.value}
                                                        type="button"
                                                        onClick={() => setValue("category", cat.value, { shouldValidate: true })}
                                                        className={cn(
                                                            "p-3 rounded-lg border text-sm font-medium transition-all text-left",
                                                            watchCategory === cat.value
                                                                ? "border-primary bg-primary/5 text-primary"
                                                                : "border-border hover:border-primary/50"
                                                        )}
                                                        aria-pressed={watchCategory === cat.value}
                                                    >
                                                        {cat.label}
                                                    </button>
                                                ))}
                                            </div>
                                            {errors.category && (
                                                <p className="text-sm text-destructive" role="alert">
                                                    {errors.category.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Title */}
                                        <div className="space-y-2">
                                            <Label htmlFor="title">Item Title *</Label>
                                            <Input
                                                id="title"
                                                placeholder="e.g., Blue Hydroflask Water Bottle"
                                                {...register("title")}
                                                aria-describedby={errors.title ? "title-error" : undefined}
                                                aria-invalid={!!errors.title}
                                            />
                                            {errors.title && (
                                                <p id="title-error" className="text-sm text-destructive" role="alert">
                                                    {errors.title.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Step 2: When & Where ──────────────────── */}
                                {currentStep === 1 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="date_occurred">Date *</Label>
                                                <Input
                                                    id="date_occurred"
                                                    type="date"
                                                    {...register("date_occurred")}
                                                    aria-describedby={errors.date_occurred ? "date-error" : undefined}
                                                    aria-invalid={!!errors.date_occurred}
                                                />
                                                {errors.date_occurred && (
                                                    <p id="date-error" className="text-sm text-destructive" role="alert">
                                                        {errors.date_occurred.message}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="time_occurred">Approximate Time *</Label>
                                                <Input
                                                    id="time_occurred"
                                                    type="time"
                                                    {...register("time_occurred")}
                                                    aria-describedby={errors.time_occurred ? "time-error" : undefined}
                                                    aria-invalid={!!errors.time_occurred}
                                                />
                                                {errors.time_occurred && (
                                                    <p id="time-error" className="text-sm text-destructive" role="alert">
                                                        {errors.time_occurred.message}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Location Selection */}
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Location *</Label>
                                            <select
                                                id="location"
                                                {...register("location")}
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                                aria-describedby={errors.location ? "location-error" : undefined}
                                                aria-invalid={!!errors.location}
                                            >
                                                <option value="">Select a location...</option>
                                                {LOCATIONS.map((loc) => (
                                                    <option key={loc} value={loc}>
                                                        {loc}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.location && (
                                                <p id="location-error" className="text-sm text-destructive" role="alert">
                                                    {errors.location.message}
                                                </p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div className="space-y-2">
                                            <Label htmlFor="description">Description *</Label>
                                            <Textarea
                                                id="description"
                                                placeholder="Describe the item in detail — color, size, brand, distinguishing features..."
                                                rows={4}
                                                {...register("description")}
                                                aria-describedby={errors.description ? "desc-error" : "desc-help"}
                                                aria-invalid={!!errors.description}
                                            />
                                            <p id="desc-help" className="text-xs text-muted-foreground">
                                                Be as specific as possible to help identify the item. Include brand, color, and any unique marks.
                                            </p>
                                            {errors.description && (
                                                <p id="desc-error" className="text-sm text-destructive" role="alert">
                                                    {errors.description.message}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Step 3: Photo Upload ──────────────────── */}
                                {currentStep === 2 && (
                                    <div className="space-y-4">
                                        <p className="text-sm text-muted-foreground">
                                            Adding a photo greatly increases the chance of reuniting with this item.
                                            This step is optional but highly recommended.
                                        </p>
                                        <FileUpload onFileSelect={setSelectedFile} />
                                        {selectedFile && (
                                            <Badge variant="secondary" className="text-xs">
                                                {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                            </Badge>
                                        )}
                                    </div>
                                )}

                                {/* ── Step 4: Contact & Security ───────────── */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="contact_email">Your Email Address *</Label>
                                            <Input
                                                id="contact_email"
                                                type="email"
                                                placeholder="you@school.edu"
                                                {...register("contact_email")}
                                                aria-describedby={errors.contact_email ? "email-error" : "email-help"}
                                                aria-invalid={!!errors.contact_email}
                                            />
                                            <p id="email-help" className="text-xs text-muted-foreground">
                                                Your email will be partially hidden (e.g., j***@school.edu) to protect your privacy.
                                            </p>
                                            {errors.contact_email && (
                                                <p id="email-error" className="text-sm text-destructive" role="alert">
                                                    {errors.contact_email.message}
                                                </p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="security_answer">
                                                Security Question: What is a unique identifying mark on this item? *
                                            </Label>
                                            <Textarea
                                                id="security_answer"
                                                placeholder="e.g., Has a scratch on the back, my initials are written inside..."
                                                rows={3}
                                                {...register("security_answer")}
                                                aria-describedby={errors.security_answer ? "security-error" : "security-help"}
                                                aria-invalid={!!errors.security_answer}
                                            />
                                            <p id="security-help" className="text-xs text-muted-foreground">
                                                This answer will be used to verify ownership when someone claims this item.
                                                Only write something that the true owner would know.
                                            </p>
                                            {errors.security_answer && (
                                                <p id="security-error" className="text-sm text-destructive" role="alert">
                                                    {errors.security_answer.message}
                                                </p>
                                            )}
                                        </div>

                                        {submitError && (
                                            <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg" role="alert">
                                                {submitError}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </CardContent>
                </Card>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 0}
                        className="gap-2"
                    >
                        <ChevronLeft className="h-4 w-4" /> Back
                    </Button>

                    {currentStep < STEPS.length - 1 ? (
                        <Button type="button" onClick={handleNext} className="gap-2">
                            Next <ChevronRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button type="submit" disabled={isSubmitting} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                                </>
                            ) : (
                                <>
                                    <Check className="h-4 w-4" /> Submit Report
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
}

/**
 * Wraps the form content in Suspense because useSearchParams()
 * requires a Suspense boundary in Next.js 14 App Router.
 */
export default function ReportPage() {
    return (
        <Suspense
            fallback={
                <div className="container mx-auto px-4 py-20 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                </div>
            }
        >
            <ReportFormContent />
        </Suspense>
    );
}
