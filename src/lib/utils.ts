export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function generateOrderNumber(): string {
  // Qikink: alphanumeric only, max 15 chars
  return `ORD${Date.now().toString().slice(-8)}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}

export function formatPrice(paise: number): string {
  return `₹${paise.toLocaleString("en-IN")}`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 11);
}
