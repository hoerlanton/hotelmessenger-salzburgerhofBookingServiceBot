import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TischplanComponent } from './components/digitalerTischplan/tischplan.component';
import { FlashMessagesModule } from 'angular2-flash-messages';
import { MomentModule } from 'angular2-moment';
import { NKDatetimeModule } from 'ng2-datetime/ng2-datetime';
import { DragulaModule } from 'ng2-dragula';

import {NgClass} from '@angular/common';
import * as $ from 'jquery';

import 'mdn-polyfills/Object.assign';
import '@angular/platform-browser';
import '@angular/platform-browser-dynamic';
import '@angular/core';
import '@angular/common';

import 'rxjs';

import '../../bower_components/bootstrap/dist/css/bootstrap.css';
import '../../bower_components/jquery/dist/jquery.min.js';
import '../../bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker3.min.css';
import '../../bower_components/bootstrap-datepicker/dist/js/bootstrap-datepicker.min.js';
import '../../node_modules/bootstrap-timepicker/css/bootstrap-timepicker.min.css';
import '../../node_modules/bootstrap-timepicker/js/bootstrap-timepicker.min.js';


@NgModule({
    declarations: [
        AppComponent, DashboardComponent, TischplanComponent
    ],
    imports: [
        NKDatetimeModule,
        BrowserModule,
        FormsModule,
        HttpModule,
        FlashMessagesModule,
        MomentModule,
        DragulaModule,
        ReactiveFormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
