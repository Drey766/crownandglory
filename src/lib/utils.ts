// ============================================================
// Utility functions used throughout the salon website
// ============================================================

// Classname helper — merges Tailwind classes cleanly
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Format KES price — e.g. 84122 → "KSh 84,122"
export function formatPrice(amount: number): string {
  return `KSh ${amount.toLocaleString("en-KE")}`;
}

// Slugify text → URL-safe lowercase string
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Format a time string "09:00" → "9:00 AM"
export function formatTime(time: string): string {
  const [hourStr, min] = time.split(":");
  const hour = parseInt(hourStr);
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${min} ${period}`;
}

// Format a date "2025-01-15" → "Wednesday, 15 January 2025"
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-KE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Format a date short "2025-01-15" → "15 Jan 2025"
export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-KE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// All 47 Kenya counties for delivery address dropdown
export const KENYA_COUNTIES = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu",
  "Garissa", "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho",
  "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui",
  "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
  "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi",
  "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
  "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
];

// Calculate shipping fee based on county
export function getShippingFee(county: string): number {
  const nairobiArea = ["Nairobi", "Kiambu", "Kajiado", "Machakos", "Murang'a"];
  if (nairobiArea.includes(county)) return 150;
  return 350; // Upcountry
}

// Truncate text to N characters with ellipsis
export function truncate(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return text.slice(0, maxChars).trimEnd() + "…";
}

// Get discount percentage between original and current price
export function discountPercent(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

// Generate time slots 9AM–6PM in 1-hour increments
export function generateTimeSlots(): string[] {
  const slots: string[] = [];
  for (let h = 9; h <= 17; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

// Category display labels
export const CATEGORY_LABELS: Record<string, string> = {
  wigs: "Wigs",
  extensions: "Hair Extensions",
  "lace-closures": "Lace Closures",
  lashes: "Eye Lashes",
};

// Service category labels
export const SERVICE_CATEGORY_LABELS: Record<string, string> = {
  "wig-services": "Wig Services",
  "washing-styling": "Hair Washing & Styling",
  braiding: "Braiding & Plaiting",
  coloring: "Coloring & Treatments",
  lashes: "Lash Services",
};

// Hair type display labels
export const HAIR_TYPE_LABELS: Record<string, string> = {
  "body-wave": "Body Wave",
  "water-wave": "Water Wave",
  "deep-wave": "Deep Wave",
  straight: "Straight",
  curly: "Curly",
  wavy: "Wavy",
  kinky: "Kinky",
  bridal: "Bridal",
};
