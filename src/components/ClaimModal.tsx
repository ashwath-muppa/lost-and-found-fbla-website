"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { claimSchema, ClaimFormData } from "@/lib/types";
import { createClaim } from "@/lib/actions";

interface ClaimModalProps {
    itemId: string;
    itemTitle: string;
}

export default function ClaimModal({ itemId, itemTitle }: ClaimModalProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitResult, setSubmitResult] = useState<"success" | "error" | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<ClaimFormData>({
        resolver: zodResolver(claimSchema),
    });

    const onSubmit = async (data: ClaimFormData) => {
        setIsSubmitting(true);
        setSubmitResult(null);

        try {
            const claim = await createClaim({
                item_id: itemId,
                claimant_name: data.claimant_name,
                claimant_email: data.claimant_email,
                security_answer: data.security_answer,
            });

            if (claim) {
                setSubmitResult("success");
                reset();
            } else {
                setSubmitResult("error");
            }
        } catch {
            setSubmitResult("error");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    size="lg"
                    className="w-full bg-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/90 text-foreground font-semibold"
                >
                    <ShieldCheck className="mr-2 h-5 w-5" />
                    Claim This Item
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Claim: {itemTitle}</DialogTitle>
                    <DialogDescription>
                        To verify ownership, please answer the security question below.
                        Your claim will be reviewed by an administrator.
                    </DialogDescription>
                </DialogHeader>

                {submitResult === "success" ? (
                    <div className="text-center py-6">
                        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                            <ShieldCheck className="h-6 w-6 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">Claim Submitted!</h3>
                        <p className="text-sm text-muted-foreground">
                            An administrator will review your claim and contact you at the
                            email address you provided.
                        </p>
                        <Button className="mt-4" variant="outline" onClick={() => setOpen(false)}>
                            Close
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="claimant_name">Your Full Name</Label>
                            <Input
                                id="claimant_name"
                                placeholder="John Doe"
                                {...register("claimant_name")}
                                aria-describedby={errors.claimant_name ? "name-error" : undefined}
                                aria-invalid={!!errors.claimant_name}
                            />
                            {errors.claimant_name && (
                                <p id="name-error" className="text-sm text-destructive" role="alert">
                                    {errors.claimant_name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="claimant_email">Your Email Address</Label>
                            <Input
                                id="claimant_email"
                                type="email"
                                placeholder="you@school.edu"
                                {...register("claimant_email")}
                                aria-describedby={errors.claimant_email ? "email-error" : undefined}
                                aria-invalid={!!errors.claimant_email}
                            />
                            {errors.claimant_email && (
                                <p id="email-error" className="text-sm text-destructive" role="alert">
                                    {errors.claimant_email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="security_answer">
                                Security Question: What is a unique identifying mark on this item?
                            </Label>
                            <Textarea
                                id="security_answer"
                                placeholder="Describe something only the true owner would know..."
                                {...register("security_answer")}
                                aria-describedby={errors.security_answer ? "security-error" : "security-help"}
                                aria-invalid={!!errors.security_answer}
                            />
                            <p id="security-help" className="text-xs text-muted-foreground">
                                This helps us verify that you are the rightful owner.
                            </p>
                            {errors.security_answer && (
                                <p id="security-error" className="text-sm text-destructive" role="alert">
                                    {errors.security_answer.message}
                                </p>
                            )}
                        </div>

                        {submitResult === "error" && (
                            <p className="text-sm text-destructive" role="alert">
                                Something went wrong. Please try again.
                            </p>
                        )}

                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Submitting Claim...
                                </>
                            ) : (
                                "Submit Claim"
                            )}
                        </Button>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
