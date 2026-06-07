import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

declare let L: any;

@Component({
  selector: 'app-order-tracking', standalone: true,
  imports: [CommonModule],
  templateUrl: './order-tracking.component.html', styleUrl: './order-tracking.component.css'
})
export class OrderTrackingComponent implements OnInit, OnDestroy {
  order: any = null; timeLeft = 60; timerInterval: any; timerDone = false; deliveryProgress = 0;
  private readonly TIMER_DURATION = 60;
  private map: any; private riderMarker: any;
  // RR Restaurant, Gandhipuram, Coimbatore
  private restaurantCoords: [number, number] = [11.0183, 76.9678];
  private userCoords: [number, number] = [11.0250, 76.9670];
  distanceKm = '';

  constructor(
    private route: ActivatedRoute, private orderService: OrderService,
    private router: Router, private http: HttpClient,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const orderId = +this.route.snapshot.paramMap.get('orderId')!;
    const user = this.auth.getUser();
    if (!user) { this.router.navigate(['/login']); return; }
    this.orderService.getUserOrders(user.id).subscribe(orders => {
      this.order = orders.find((o: any) => o.id === orderId);
      if (this.order) {
        if (this.order.status === 'DELIVERED') {
          this.timeLeft = 0; this.timerDone = true; this.deliveryProgress = 100;
        } else {
          this.resumeOrStartTimer();
        }
        this.geocodeAndInitMap();
      }
    });
  }

  geocodeAndInitMap() {
    const address = this.order.deliveryAddress || '';
    if (address) {
      this.geocodeAddress(address).subscribe(coords => {
        if (coords) {
          this.userCoords = coords;
        }
        this.initMap();
      });
    } else {
      this.initMap();
    }
  }

  private geocodeAddress(addr: string): Observable<[number, number] | null> {
    const queries: string[] = [];
    const pincodeMatch = addr.match(/\d{6}/);
    const isPurePin = /^\d{6}$/.test(addr.trim());

    if (isPurePin) {
      queries.push(`${addr.trim()}, India`);
    } else {
      queries.push(addr.toLowerCase().includes('coimbatore') ? addr : `${addr}, Coimbatore, Tamil Nadu`);
      const parts = addr.split(/[,;]+/).map(p => p.trim()).filter(p => p.length > 0);
      if (parts.length > 1) {
        queries.push(parts.slice(-2).join(', '));
        queries.push(parts.slice(-3).join(', '));
      }
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

  initMap() {
    setTimeout(() => {
      const mapEl = document.getElementById('tracking-map');
      if (!mapEl) return;

      this.map = L.map('tracking-map', { zoomControl: true, scrollWheelZoom: true });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      // Restaurant marker
      const restIcon = L.divIcon({
        html: '<div style="background:#e65100;color:#fff;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff;"><i class="fa-solid fa-store"></i></div>',
        className: '', iconSize: [38, 38], iconAnchor: [19, 19]
      });
      L.marker(this.restaurantCoords, { icon: restIcon }).addTo(this.map)
        .bindPopup('<b>RR Restaurant</b><br>Coimbatore');

      // User marker
      const homeIcon = L.divIcon({
        html: '<div style="background:#1565c0;color:#fff;border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,0.3);border:2px solid #fff;"><i class="fa-solid fa-house"></i></div>',
        className: '', iconSize: [38, 38], iconAnchor: [19, 19]
      });
      L.marker(this.userCoords, { icon: homeIcon }).addTo(this.map)
        .bindPopup('<b>Delivery Address</b><br>' + (this.order.deliveryAddress || 'Your location'));

      // Dashed route line
      L.polyline([this.restaurantCoords, this.userCoords], {
        color: '#ff6b35', weight: 4, dashArray: '10, 8', opacity: 0.8
      }).addTo(this.map);

      // Rider marker
      const riderIcon = L.divIcon({
        html: '<div class="rider-pulse" style="background:#ff6b35;color:#fff;border-radius:50%;width:42px;height:42px;display:flex;align-items:center;justify-content:center;font-size:19px;box-shadow:0 3px 12px rgba(255,107,53,0.5);border:3px solid #fff;"><i class="fa-solid fa-motorcycle"></i></div>',
        className: '', iconSize: [42, 42], iconAnchor: [21, 21]
      });
      this.riderMarker = L.marker(this.getRiderPosition(), { icon: riderIcon, zIndexOffset: 1000 }).addTo(this.map);

      // Distance
      const d = this.map.distance(this.restaurantCoords, this.userCoords);
      this.distanceKm = (d / 1000).toFixed(1);

      // Fit bounds
      const bounds = L.latLngBounds([this.restaurantCoords, this.userCoords]);
      this.map.fitBounds(bounds, { padding: [60, 60] });
    }, 200);
  }

  getRiderPosition(): [number, number] {
    const p = this.deliveryProgress / 100;
    return [
      this.restaurantCoords[0] + (this.userCoords[0] - this.restaurantCoords[0]) * p,
      this.restaurantCoords[1] + (this.userCoords[1] - this.restaurantCoords[1]) * p
    ];
  }

  updateRider() {
    if (this.riderMarker) this.riderMarker.setLatLng(this.getRiderPosition());
  }

  resumeOrStartTimer() {
    const key = 'order_timer_' + this.order.id;
    let startTime = localStorage.getItem(key);
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(key, startTime);
      this.orderService.updateStatus(this.order.id, 'DELIVERING').subscribe();
    }
    const elapsed = Math.floor((Date.now() - +startTime) / 1000);
    this.timeLeft = Math.max(0, this.TIMER_DURATION - elapsed);
    this.deliveryProgress = ((this.TIMER_DURATION - this.timeLeft) / this.TIMER_DURATION) * 100;
    if (this.timeLeft <= 0) {
      this.timerDone = true; this.deliveryProgress = 100;
      this.orderService.updateStatus(this.order.id, 'DELIVERED').subscribe();
      return;
    }
    this.startTimer();
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      this.deliveryProgress = ((this.TIMER_DURATION - this.timeLeft) / this.TIMER_DURATION) * 100;
      this.updateRider();
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.timerDone = true; this.deliveryProgress = 100;
        this.updateRider();
        localStorage.removeItem('order_timer_' + this.order.id);
        this.orderService.updateStatus(this.order.id, 'DELIVERED').subscribe();
      }
    }, 1000);
  }

  get minutes() { return Math.floor(this.timeLeft / 60); }
  get seconds() { return this.timeLeft % 60; }
  goToReview() { this.router.navigate(['/review', this.order.id]); }
  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.map) this.map.remove();
  }
}
