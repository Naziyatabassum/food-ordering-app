import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

declare let L: any;

@Component({
  selector: 'app-cart', standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './cart.component.html', styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit {
  addressOption = 'default';
  customAddress = '';
  defaultAddress = '';
  validating = false;
  addressError = '';
  private map: any;
  // RR Restaurant, Gandhipuram, Coimbatore
  private restaurantCoords: [number, number] = [11.0183, 76.9678];
  private readonly MAX_DISTANCE_KM = 30;

  constructor(public cartService: CartService, private orderService: OrderService, private auth: AuthService, private router: Router, private http: HttpClient) {}

  ngOnInit() {
    const user = this.auth.getUser();
    if (user) this.defaultAddress = user.address || '';
  }

  get items() { return this.cartService.getItems(); }
  get total() { return this.cartService.getTotal(); }
  get deliveryAddress() { return this.addressOption === 'default' ? this.defaultAddress : this.customAddress; }

  increase(pid: number) { const i = this.items.find((x: any) => x.product.id === pid); if (i) this.cartService.updateQuantity(pid, i.quantity + 1); }
  decrease(pid: number) { const i = this.items.find((x: any) => x.product.id === pid); if (i) this.cartService.updateQuantity(pid, i.quantity - 1); }
  remove(pid: number) { this.cartService.removeFromCart(pid); }

  placeOrder() {
    const user = this.auth.getUser();
    if (!user) return;
    if (!this.deliveryAddress.trim()) { this.addressError = 'Please enter a delivery address'; return; }
    this.addressError = '';
    this.validating = true;

    // Geocode the address - try multiple search strategies
    const addr = this.deliveryAddress.trim();
    this.tryGeocode(addr).subscribe(coords => {
      if (!coords) {
        this.validating = false;
        this.addressError = 'Could not find this address. Please enter a valid address, area name, or 6-digit pincode.';
        return;
      }
      const distance = this.haversine(this.restaurantCoords[0], this.restaurantCoords[1], coords[0], coords[1]);

      if (distance > this.MAX_DISTANCE_KM) {
        this.validating = false;
        this.addressError = `Delivery not available. Your location is ${distance.toFixed(1)} km away. We deliver only within ${this.MAX_DISTANCE_KM} km of RR Restaurant, Coimbatore.`;
        this.showDistanceMap(coords[0], coords[1], distance);
        return;
      }

      // Address is valid — place order
      const orderItems = this.items.map((i: any) => ({ productId: i.product.id, quantity: i.quantity }));
      this.orderService.placeOrder(user.id, orderItems, this.deliveryAddress).subscribe((order: any) => {
        this.validating = false;
        this.cartService.clear();
        this.router.navigate(['/order-tracking', order.id]);
      });
    });
  }

  private tryGeocode(addr: string): Observable<[number, number] | null> {
    // Build multiple search queries as fallbacks
    const queries: string[] = [];
    const pincodeMatch = addr.match(/\d{6}/);
    const isPurePin = /^\d{6}$/.test(addr);

    if (isPurePin) {
      queries.push(`${addr}, India`);
    } else {
      // Try original address
      queries.push(addr.toLowerCase().includes('coimbatore') ? addr : `${addr}, Coimbatore, Tamil Nadu`);
      // Try simplified: remove company names, keep area/locality
      const parts = addr.split(/[,;]+/).map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length > 1) {
        // Try last parts (usually area, city, pincode)
        queries.push(parts.slice(-2).join(', '));
        queries.push(parts.slice(-3).join(', '));
      }
      // If has pincode, try just the pincode
      if (pincodeMatch) {
        queries.push(`${pincodeMatch[0]}, India`);
      }
    }

    return this.searchSequential(queries, 0);
  }

  private searchSequential(queries: string[], index: number): Observable<[number, number] | null> {
    if (index >= queries.length) return of(null);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queries[index])}&limit=1`;
    return this.http.get<any[]>(url).pipe(
      switchMap(results => {
        if (results && results.length > 0) {
          return of([parseFloat(results[0].lat), parseFloat(results[0].lon)] as [number, number]);
        }
        return this.searchSequential(queries, index + 1);
      })
    );
  }

  private haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private showDistanceMap(userLat: number, userLon: number, distance: number) {
    setTimeout(() => {
      const mapEl = document.getElementById('distance-map');
      if (!mapEl) return;
      if (this.map) { this.map.remove(); this.map = null; }

      this.map = L.map('distance-map', { zoomControl: true, scrollWheelZoom: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      // Restaurant marker
      const restIcon = L.divIcon({
        html: '<div style="background:#e65100;color:#fff;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff;"><i class="fa-solid fa-store"></i></div>',
        className: '', iconSize: [38, 38], iconAnchor: [19, 19]
      });
      L.marker(this.restaurantCoords, { icon: restIcon }).addTo(this.map)
        .bindPopup('<b>RR Restaurant</b><br>Coimbatore').openPopup();

      // User location marker
      const userIcon = L.divIcon({
        html: '<div style="background:#d32f2f;color:#fff;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff;"><i class="fa-solid fa-location-dot"></i></div>',
        className: '', iconSize: [38, 38], iconAnchor: [19, 19]
      });
      L.marker([userLat, userLon], { icon: userIcon }).addTo(this.map)
        .bindPopup(`<b>Your Location</b><br>${distance.toFixed(1)} km away`).openPopup();

      // Line between them
      L.polyline([this.restaurantCoords, [userLat, userLon]], {
        color: '#d32f2f', weight: 3, dashArray: '8, 6', opacity: 0.8
      }).addTo(this.map);

      // 30km radius circle
      L.circle(this.restaurantCoords, { radius: this.MAX_DISTANCE_KM * 1000, color: '#28a745', fillColor: '#28a745', fillOpacity: 0.05, weight: 2, dashArray: '5,5' }).addTo(this.map);

      const bounds = L.latLngBounds([this.restaurantCoords, [userLat, userLon]]);
      this.map.fitBounds(bounds, { padding: [50, 50] });
    }, 100);
  }
}
