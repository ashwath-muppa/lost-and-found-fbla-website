"use client";

import React, { useState, useRef, useCallback } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
    onFileSelect: (file: File | null) => void;
    error?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function FileUpload({ onFileSelect, error }: FileUploadProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const validateAndSetFile = useCallback(
        (file: File | null) => {
            setFileError(null);

            if (!file) {
                setPreview(null);
                onFileSelect(null);
                return;
            }

            if (!ACCEPTED_TYPES.includes(file.type)) {
                setFileError("Please upload a JPEG, PNG, WebP, or GIF image.");
                return;
            }

            if (file.size > MAX_FILE_SIZE) {
                setFileError("File size must be under 5MB.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(file);

            onFileSelect(file);
        },
        [onFileSelect]
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            const file = e.dataTransfer.files[0];
            validateAndSetFile(file);
        },
        [validateAndSetFile]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        validateAndSetFile(file);
    };

    const removeFile = () => {
        setPreview(null);
        onFileSelect(null);
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div>
            {!preview ? (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={cn(
                        "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
                        isDragOver
                            ? "border-[hsl(var(--accent))] bg-[hsl(var(--accent))]/5 scale-[1.02]"
                            : "border-border hover:border-[hsl(var(--accent))]/50 hover:bg-muted/50"
                    )}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            inputRef.current?.click();
                        }
                    }}
                    aria-label="Upload an image of the item"
                    aria-describedby="file-upload-help"
                >
                    <div className="flex flex-col items-center gap-3">
                        <div className="rounded-full bg-muted p-4">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div>
                            <p className="font-medium">
                                {isDragOver ? "Drop your image here" : "Drag & drop an image, or click to browse"}
                            </p>
                            <p id="file-upload-help" className="text-sm text-muted-foreground mt-1">
                                JPEG, PNG, WebP, or GIF — Max 5MB
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative rounded-xl overflow-hidden border bg-muted">
                    <img
                        src={preview}
                        alt="Preview of uploaded item photo"
                        className="w-full h-64 object-cover"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-3 right-3 rounded-full shadow-lg"
                        onClick={removeFile}
                        aria-label="Remove uploaded image"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={handleChange}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
            />

            {(fileError || error) && (
                <p className="text-sm text-destructive mt-2" role="alert">
                    {fileError || error}
                </p>
            )}
        </div>
    );
}
