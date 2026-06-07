import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  private items: any[] = [];

  getItems(): any[] { return this.items; }
  addToCart(product: any): void {
    const existing = this.items.find(i => i.product.id === product.id);
    if (existing) { existing.quantity++; } else { this.items.push({ product, quantity: 1 }); }
  }
  removeFromCart(productId: number): void { this.items = this.items.filter(i => i.product.id !== productId); }
  updateQuantity(productId: number, quantity: number): void {
    const item = this.items.find(i => i.product.id === productId);
    if (item) { item.quantity = quantity; if (item.quantity <= 0) this.removeFromCart(productId); }
  }
  isInCart(productId: number): boolean { return this.items.some(i => i.product.id === productId); }
  getQuantityInCart(productId: number): number { const item = this.items.find(i => i.product.id === productId); return item ? item.quantity : 0; }
  getTotal(): number { return this.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0); }
  getItemCount(): number { return this.items.reduce((sum, i) => sum + i.quantity, 0); }
  clear(): void { this.items = []; }
}
