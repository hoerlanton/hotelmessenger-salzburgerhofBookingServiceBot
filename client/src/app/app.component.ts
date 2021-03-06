import { Component } from '@angular/core';
import { DashboardService } from './services/dashboard.service';
import { TischplanService } from './services/tischplan.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [DashboardService, TischplanService],
})
export class AppComponent {
  title = 'App works!';
}
