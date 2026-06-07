import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-users', standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-users.component.html', styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  constructor(private auth: AuthService) {}
  ngOnInit() { this.auth.getAllUsers().subscribe(u => this.users = u); }
}
