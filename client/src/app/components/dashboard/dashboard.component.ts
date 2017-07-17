import { Component } from '@angular/core';
import { DashboardService } from '../../services/dashboard.service';
import { Guest } from '../../../../Guest';
import { Messages } from '../../../../Messages';
import { Http } from '@angular/http';
import { OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { FlashMessagesService } from 'angular2-flash-messages';


@Component({
    selector: 'dashboard',
    templateUrl: 'dashboard.component.html',
    styleUrls: ['dashboard.component.css']
})
export class DashboardComponent implements OnInit {
    guests: Guest[];
    sentMessages: Messages[];
    title: string;
    dateGenerated: any;
    filesToUpload: Array<File> = [];

    constructor(private dashboardService: DashboardService, private http: Http, private _flashMessagesService: FlashMessagesService) {
        this.dashboardService.getGuests()
            .subscribe(guests => {
                this.guests = guests;
            });

        this.dashboardService.getMessages()
            .subscribe(sentMessages => {
                this.sentMessages = sentMessages;
            });
    }

    sendMessage(event) {
        event.preventDefault();
        this.dateGenerated = new Date();
        let newMessage = {
            text: this.title,
            date: this.dateGenerated
        };
        console.log(newMessage);

        this.dashboardService.sendMessage(newMessage)
            .subscribe(Messages => {
                this.sentMessages.push(Messages);
                this.title = '';
            });
    }

    ngOnInit() {

    }

    upload() {
        const formData: any = new FormData();
        const files: Array<File> = this.filesToUpload;

        formData.append('uploads[]', files[0], files[0]['name']);

        this.http.post('/upload', formData)
            .map(files => files.json()).map(res =>
            // 1st parameter is a flash message text
            // 2nd parameter is optional. You can pass object with options.
            this._flashMessagesService.show('Erfolgreich Datei angehängt', { cssClass: 'alert-success', timeout: 10000 }))
            .subscribe(files => console.log('files', files));
    }

    fileChangeEvent(fileInput: any) {
        this.filesToUpload = <Array<File>>fileInput.target.files;
        //this.successMsg = "Hoi" + fileInput.target.files[0]['name'];
        //console.log(this.successMsg);
        //this.product.photo = fileInput.target.files[0]['name'];
    }
}
