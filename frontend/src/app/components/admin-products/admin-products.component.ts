import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-admin-products', standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html', styleUrl: './admin-products.component.css'
})
export class AdminProductsComponent implements OnInit {
  products: any[] = [];
  newProduct = { name: '', description: '', price: 0, category: 'VEG', imageUrl: '' };
  editProduct: any = null;
  showForm = false; success = '';
  constructor(private productService: ProductService) {}
  ngOnInit() { this.loadProducts(); }
  loadProducts() { this.productService.getProducts().subscribe(p => this.products = p); }
  addProduct() {
    this.productService.addProduct(this.newProduct).subscribe(() => {
      this.success = 'Product added successfully!';
      this.newProduct = { name: '', description: '', price: 0, category: 'VEG', imageUrl: '' };
      this.showForm = false; this.loadProducts();
      setTimeout(() => this.success = '', 3000);
    });
  }
  startEdit(p: any) {
    this.editProduct = { ...p };
    this.showForm = false;
  }
  cancelEdit() { this.editProduct = null; }
  saveEdit() {
    this.productService.updateProduct(this.editProduct.id, this.editProduct).subscribe(() => {
      this.success = 'Product updated successfully!';
      this.editProduct = null; this.loadProducts();
      setTimeout(() => this.success = '', 3000);
    });
  }
  deleteProduct(id: number) { if (confirm('Delete this product?')) this.productService.deleteProduct(id).subscribe(() => this.loadProducts()); }
}
