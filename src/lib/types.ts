import { z } from "zod";

export interface Item {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  type: ItemType;
  location: string;
  date_occurred: string;
  time_occurred: string;
  contact_email: string;
  image_url: string | null;
  status: ItemStatus;
  security_answer: string;
  created_at: string;
}

export interface Claim {
  id: string;
  item_id: string;
  claimant_name: string;
  claimant_email: string;
  security_answer: string;
  status: ClaimStatus;
  created_at: string;
  item?: Item;
}

export type ItemCategory = "electronics" | "clothing" | "books" | "accessories" | "sports" | "other";
export type ItemType = "lost" | "found";
export type ItemStatus = "pending" | "approved" | "returned";
export type ClaimStatus = "pending" | "approved" | "denied";

export const CATEGORIES: { value: ItemCategory; label: string }[] = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books & Notebooks" },
  { value: "accessories", label: "Accessories" },
  { value: "sports", label: "Sports Equipment" },
  { value: "other", label: "Other" },
];

export const LOCATIONS: string[] = [
  "Main Office",
  "Cafeteria",
  "Library",
  "Gym / Locker Room",
  "Science Lab",
  "Computer Lab",
  "Auditorium",
  "Hallway - 1st Floor",
  "Hallway - 2nd Floor",
  "Hallway - 3rd Floor",
  "Parking Lot",
  "Football Field",
  "Bus Stop",
  "Other",
];

export const reportStep1Schema = z.object({
  type: z.enum(["lost", "found"], { error: "Please select whether you lost or found this item" }),
  category: z.enum(["electronics", "clothing", "books", "accessories", "sports", "other"], {
    error: "Please select a category",
  }),
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title must be under 100 characters"),
});

export const reportStep2Schema = z.object({
  date_occurred: z.string().min(1, "Please select a date"),
  time_occurred: z.string().min(1, "Please provide an approximate time"),
  location: z.string().min(1, "Please select a location"),
  description: z.string().min(10, "Description must be at least 10 characters").max(500, "Description must be under 500 characters"),
});

export const reportStep3Schema = z.object({
  image: z.any().optional(),
});

export const reportStep4Schema = z.object({
  contact_email: z.string().email("Please enter a valid email address"),
  security_answer: z.string().min(3, "Security answer must be at least 3 characters").max(200, "Security answer must be under 200 characters"),
});

export const fullReportSchema = reportStep1Schema
  .merge(reportStep2Schema)
  .merge(reportStep3Schema)
  .merge(reportStep4Schema);

export type ReportFormData = z.infer<typeof fullReportSchema>;

export const claimSchema = z.object({
  claimant_name: z.string().min(2, "Name must be at least 2 characters"),
  claimant_email: z.string().email("Please enter a valid email address"),
  security_answer: z.string().min(1, "Please answer the security question"),
});

export type ClaimFormData = z.infer<typeof claimSchema>;
