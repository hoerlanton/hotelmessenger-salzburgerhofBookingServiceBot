import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';

@Injectable()
export class TischplanService {
    constructor(private http: Http) {
        console.log('Task service initialized!');
    }
    getImHausListe() {
        return this.http.get('imHausListe')
            .map(res => res.json());
    }
    getAnreiseListe() {
        return this.http.get('anreiseListe')
            .map(res => res.json());
    }
    getTracesListe() {
        return this.http.get('tracesListe')
            .map(res => res.json());
    }



    sendMessage(newMessage) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        console.log(headers);
        return this.http.post('guestsMessage', newMessage, {headers: headers} )
            .map(res => res.json());
    }

    scheduleMessage(scheduledMessage) {
        var headers = new Headers();
        headers.append('Content-Type', 'application/json');
        console.log(headers);
        return this.http.post('guestsMessage', scheduledMessage, {headers: headers} )
            .map(res => res.json());
    }
}