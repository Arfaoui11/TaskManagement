import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-topbar',
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.css'
})
export class TopbarComponent {

  currentUser: User | null = null;

  constructor(private authService: AuthService,    private router: Router
) {}

  ngOnInit() {
    this.currentUser = this.authService.getUserInfo(); // Assurez-vous que ceci renvoie un User ou null
  }
   logout(): void {
    this.authService.logout();
  }

  
}

