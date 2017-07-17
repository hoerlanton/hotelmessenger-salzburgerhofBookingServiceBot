import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { FlashMessagesModule } from 'angular2-flash-messages';
import { MomentModule } from 'angular2-moment';


@NgModule({
  declarations: [
    AppComponent, DashboardComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    FlashMessagesModule,
    MomentModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
