// E-commerce Storefront Cart Module - Autonomously Patched
export interface CartItem {
  sku: string;
  price: number;
  quantity: number;
}

export function calculateCartTotal(items: CartItem[], discountRate: number): number {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const validDiscount = Math.max(0, Math.min(1, discountRate || 0));
  return subtotal * (1 - validDiscount);
}
