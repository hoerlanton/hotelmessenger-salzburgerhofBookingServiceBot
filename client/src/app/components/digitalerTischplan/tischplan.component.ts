import { Component } from '@angular/core';
import { ElementRef } from '@angular/core';
import { TischplanService } from '../../services/tischplan.service';
import { DragulaService } from "ng2-dragula";
import { Guest } from '../../../../Guest';
import { Table } from '../../../../Table';
import { BgColor } from '../../../../BgColor';
import { Messages } from '../../../../Messages';
import { Http } from '@angular/http';
import { OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { FlashMessagesService } from 'angular2-flash-messages';

@Component({
    selector: 'tischplan',
    templateUrl: 'tischplan.component.html',
    styleUrls: ['tischplan.component.css'],
})

export class TischplanComponent implements OnInit {
    bgColors: BgColor[];
    guests: Guest[];
    tables: Table[];
    sentMessages: Messages[];
    title: string;
    dateGenerated: any;
    filesToUpload: Array<File> = [];
    scheduledDate: Date = new Date(2016, 5, 10);
    scheduledMessages: Messages[];
    isBesetzt: boolean = true;
    datepickerOpts = {
        startDate: new Date(2016, 5, 10),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'D, d MM yyyy'
    };


    constructor(private tischplanService: TischplanService, private http: Http, private _flashMessagesService: FlashMessagesService, private dragulaService: DragulaService, private element: ElementRef) {
        let DomBaseElement = this.element.nativeElement;
        let wrapperElementsChildNames = [];

        this.tischplanService.getGuests()
            .subscribe(guests => {
                this.guests = guests;
            });

        this.tischplanService.getMessages()
            .subscribe(sentMessages => {
                this.sentMessages = sentMessages;
            });

        this.tischplanService.getScheduledMessages()
            .subscribe(scheduledMessages => {
                this.scheduledMessages = scheduledMessages;
            });

        //92
        this.tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525];
        this.bgColors = ['ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff'];

        dragulaService.drag.subscribe((value) => {
            console.log(`drag: ${value[0]}`);
            this.onDrag(value.slice(1));
        });
        dragulaService.drop.subscribe((value) => {
            console.log(`drop: ${value[0]}`);
            this.onDrop(value.slice(1), DomBaseElement, wrapperElementsChildNames);
        });
        dragulaService.over.subscribe((value) => {
            console.log(`over: ${value[0]}`);
            this.onOver(value.slice(1));
        });
        dragulaService.out.subscribe((value) => {
            console.log(`out: ${value[0]}`);
            this.onOut(value.slice(1));
        });
    }

    private onDrag(args) {
        let [e, el] = args;
    }

    private onDrop(args, DomBaseElement, wrapperElementsChildNames) {
        let [e, el] = args;
        //Check if one of the elements with the id #container has a element with the id #card as child element
        let containerElements = DomBaseElement.querySelectorAll('.container a');
        //console.log("ContainerElements:");
        console.log("Container Elements");

        console.log(containerElements);
        console.log(containerElements.length);
        for (var k = 0; k < containerElements.length; k++) {
            if (containerElements[k].hasChildNodes("#card") != null) {
                //if so change the background color of this element
                //console.log(document.getElementsByClassName('.container'));
                //console.log(DomBaseElement.querySelector('.container').querySelector('.table'));
                let wrapperElements = DomBaseElement.querySelectorAll('.wrapper a');
                let wrapperElementsLength = document.getElementById("wrapper").childNodes.length;
                let wrapperElementsNames = document.getElementById("wrapper").childNodes;

                console.log("WrapperElements:");
                console.log(wrapperElements);
                console.log(wrapperElementsLength);
                //console.log(wrapperElementsNames);
                //console.log(document.getElementById("container").childNodes);
                for (let j = 0; j < wrapperElementsLength; j++) {
                    wrapperElementsChildNames.push(wrapperElementsNames.item(j));
                    //wrapperElementsChildNames.push(wrapperElementsNames[j].childNodes);
                    //var hii = DOMParser.parse.wrapperElementsChildNames[j];
                    //console.log(wrapperElementsChildNames[j].childNodes);
                    //console.log(wrapperElementsChildNames[j].childNodes[3].childNodes[0]);
                    //console.log(wrapperElementsChildNames[j].childNodes[3].childNodes[0] > 1);
                    //console.log(wrapperElementsChildNames[j]);
                    //console.log(wrapperElementsChildNames[j].childNodes);
                    var elementByXpath = [];
                    elementByXpath.push(document.evaluate('//*[@id="card"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue);
                }

                    //console.log(elementByXpath[j]);
                    //if (elementByXpath[j] != null) {
                    //    this.bgColors[j] = "0a7a74";
                    //}


                    //if (elementByXpath != null) {
                    //    element.value = '...';
                    //}

                    //console.log(wrapperElementsChildNames);
                    //console.log(wrapperElementsChildNames[j].item(2));

                    //if (wrapperElementsNames[j].childNodes ) {
                    //       this.bgColors[j] = "0a7a74";
                    //   }

                    //function isInPage(node) {
                    //    return (node === document.body) ? false : document.body.contains(node);
                    //}


                    //if (wrapperElementsChildNames.childNodes("#card") != null) {
                    //   this.bgColors[j] = "0a7a74";
                    //}


                //if (document.getElementById("container").childNodes[j] != null) {
                //}
            }
        }
    }


    private onOver(args) {
        let [e, el, container] = args;
        // do something
    }

    private onOut(args) {
        let [e, el, container] = args;
        // do something
    }


    clicked(event) {
        console.log(this.scheduledDate);
        let scheduledMessage = {
            text: this.title,
            date: this.scheduledDate.toString(),
        };
        console.log(scheduledMessage);

        this.tischplanService.scheduleMessage(scheduledMessage)
            .subscribe(Messages => {
                this.scheduledMessages.push(Messages);
                this.title = '';
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

        this.tischplanService.sendMessage(newMessage)
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
            this._flashMessagesService.show('Erfolgreich Datei angehängt', {cssClass: 'alert-success', timeout: 10000}))
            .subscribe(files => console.log('files', files));
    }

    fileChangeEvent(fileInput: any) {
        this.filesToUpload = <Array<File>>fileInput.target.files;
        //this.successMsg = "Hoi" + fileInput.target.files[0]['name'];
        //console.log(this.successMsg);
        //this.product.photo = fileInput.target.files[0]['name'];
    }
}
/*
    besetzt(i){
        if (this.bgColors[i] === "ffffff") {
        this.bgColors[i] = "0a7a74"} else {
            this.bgColors[i] = "ffffff"
        }
    }

}
*/

// html file deleted:
// {{"Kann zahlen: " + guest.is_payment_enabled}}