import { supabase } from "./supabase";
import { Item, Claim, ItemStatus, ItemType, ItemCategory, ReportFormData } from "./types";

export async function getItems(filters?: {
    type?: ItemType;
    category?: ItemCategory;
    status?: ItemStatus;
    search?: string;
}): Promise<Item[]> {
    let query = supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

    if (filters?.type) {
        query = query.eq("type", filters.type);
    }
    if (filters?.category) {
        query = query.eq("category", filters.category);
    }
    if (filters?.status) {
        query = query.eq("status", filters.status);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching items:", error);
        return [];
    }

    return (data as Item[]) || [];
}

export async function getAllItems(): Promise<Item[]> {
    const { data, error } = await supabase
        .from("items")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching all items:", error);
        return [];
    }

    return (data as Item[]) || [];
}

export async function getItemById(id: string): Promise<Item | null> {
    const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        console.error("Error fetching item:", error);
        return null;
    }

    return data as Item;
}

export async function createItem(formData: ReportFormData, imageUrl: string | null): Promise<Item | null> {
    const { data, error } = await supabase
        .from("items")
        .insert({
            title: formData.title,
            description: formData.description,
            category: formData.category,
            type: formData.type,
            location: formData.location,
            date_occurred: formData.date_occurred,
            time_occurred: formData.time_occurred,
            contact_email: formData.contact_email,
            image_url: imageUrl,
            security_answer: formData.security_answer.toLowerCase().trim(),
            status: "pending",
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating item:", error);
        return null;
    }

    return data as Item;
}

export async function updateItemStatus(id: string, status: ItemStatus): Promise<boolean> {
    const { error } = await supabase
        .from("items")
        .update({ status })
        .eq("id", id);

    if (error) {
        console.error("Error updating item status:", error);
        return false;
    }

    return true;
}

export async function deleteItem(id: string): Promise<boolean> {
    const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting item:", error);
        return false;
    }

    return true;
}

export async function getRecentItems(limit: number = 5): Promise<Item[]> {
    const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Error fetching recent items:", error);
        return [];
    }

    return (data as Item[]) || [];
}

export async function createClaim(claimData: {
    item_id: string;
    claimant_name: string;
    claimant_email: string;
    security_answer: string;
}): Promise<Claim | null> {
    const { data, error } = await supabase
        .from("claims")
        .insert({
            ...claimData,
            security_answer: claimData.security_answer.toLowerCase().trim(),
            status: "pending",
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating claim:", error);
        return null;
    }

    return data as Claim;
}

export async function getAllClaims(): Promise<Claim[]> {
    const { data, error } = await supabase
        .from("claims")
        .select("*, item:items(*)")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching claims:", error);
        return [];
    }

    return (data as Claim[]) || [];
}

export async function updateClaimStatus(id: string, status: "approved" | "denied"): Promise<boolean> {
    const { error } = await supabase
        .from("claims")
        .update({ status })
        .eq("id", id);

    if (error) {
        console.error("Error updating claim status:", error);
        return false;
    }

    return true;
}

export async function uploadImage(file: File): Promise<string | null> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const { error } = await supabase.storage
        .from("item-images")
        .upload(fileName, file);

    if (error) {
        console.error("Error uploading image:", error);
        return null;
    }

    const { data } = supabase.storage
        .from("item-images")
        .getPublicUrl(fileName);

    return data.publicUrl;
}

export async function getAnalytics(): Promise<{
    totalItems: number;
    lostItems: number;
    foundItems: number;
    returnedItems: number;
    pendingItems: number;
    totalClaims: number;
}> {
    const [itemsRes, claimsRes] = await Promise.all([
        supabase.from("items").select("type, status"),
        supabase.from("claims").select("id"),
    ]);

    const items = (itemsRes.data as Pick<Item, "type" | "status">[]) || [];
    const claims = claimsRes.data || [];

    return {
        totalItems: items.length,
        lostItems: items.filter((i) => i.type === "lost").length,
        foundItems: items.filter((i) => i.type === "found").length,
        returnedItems: items.filter((i) => i.status === "returned").length,
        pendingItems: items.filter((i) => i.status === "pending").length,
        totalClaims: claims.length,
    };
}
