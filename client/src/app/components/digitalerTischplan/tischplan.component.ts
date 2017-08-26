import { Component, Directive, Input, ElementRef, ViewChild, Renderer } from '@angular/core';
import { TischplanService } from '../../services/tischplan.service';
import { DragulaService } from "ng2-dragula";
import { Guest } from '../../../../Guest';
import { ImHausListe } from '../../../../ImHausListe';
import { AnreiseListe } from '../../../../AnreiseListe';
import { TracesListe } from '../../../../TracesListe';
import { Table } from '../../../../Table';
import { BgColor } from '../../../../BgColor';
import { LeftValue } from '../../../../LeftValue';
import { TopValue } from '../../../../TopValue';
import { buttonBgColor } from '../../../../buttonBgColor';
import { IsBesetzt } from '../../../../IsBesetzt';
import { Messages } from '../../../../Messages';
import { Http } from '@angular/http';
import { OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { FlashMessagesService } from 'angular2-flash-messages';
import {NgClass} from '@angular/common';

@Component({
    selector: 'tischplan',
    templateUrl: 'tischplan.component.html',
    styleUrls: ['tischplan.component.css'],
})

export class TischplanComponent implements OnInit {
    buttonBgColor1: string;
    buttonBgColor2: string;
    buttonBgColor3: string;
    buttonBgColor4: string;
    fontColor1: string;
    fontColor2: string;
    fontColor3: string;
    fontColor4: string;
    leftValues: LeftValue[];
    topValues: TopValue[];
    bgColors: BgColor[];
    guests: Guest[];
    imHausListeElemente: ImHausListe[];
    anreiseListeElemente: AnreiseListe[];
    tracesListeElemente: TracesListe[];
    tables: Table[];
    sentMessages: Messages[];
    title: string;
    dateGenerated: any;
    filesToUpload: Array<File> = [];
    scheduledDate: Date = new Date(2016, 5, 10);
    scheduledMessages: Messages[];
    isBesetzt: IsBesetzt[];
    datepickerOpts = {
        startDate: new Date(2016, 5, 10),
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true,
        assumeNearbyYear: true,
        format: 'D, d MM yyyy'
    };

    @ViewChild('myTable') input: ElementRef;

    constructor(private tischplanService: TischplanService, private http: Http, private _flashMessagesService: FlashMessagesService, private dragulaService: DragulaService, private element: ElementRef, private renderer: Renderer) {
        let DomBaseElement = this.element.nativeElement;
        let wrapperElementsChildNames = [];

        this.tischplanService.getImHausListe()
            .subscribe(imHausListeElemente => {
                this.imHausListeElemente = imHausListeElemente;
            });

        this.tischplanService.getAnreiseListe()
            .subscribe(anreiseListeElemente => {
                this.anreiseListeElemente = anreiseListeElemente;
            });

        this.tischplanService.getTracesListe()
            .subscribe(tracesListeElemente => {
                this.tracesListeElemente = tracesListeElemente;
            });

        //92
        //this.tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525];
        this.bgColors = ['ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff'];
        this.isBesetzt = [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false];
        this.buttonBgColor1 = "eaf3f3";
        this.buttonBgColor2 = "eaf3f3";
        this.buttonBgColor3 = "eaf3f3";
        this.buttonBgColor4 = "eaf3f3";
        this.fontColor1 = "0a7a74";
        this.fontColor2 = "0a7a74";
        this.fontColor3 = "0a7a74";
        this.fontColor4 = "0a7a74";


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
        console.log("Args = ");
        console.log(args);
        //Check if one of the elements with the id #container has a element with the id #card as child element
        let containerElements = DomBaseElement.querySelectorAll('.container a');
        console.log("ContainerElements:");
        console.log("Container Elements = ");
        console.log(containerElements);
        console.log(containerElements.length);
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
        //this.renderer.invokeElementMethod(this.input.nativeElement, 'focus');
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

    besetzt(i, h, j) {
        if (this.bgColors[i] === "ffffff") {
            this.bgColors[i] = "0a7a74";
            if (this.tables[j] === this.tables[j - 1]) {
                this.bgColors[i - 1] = "0a7a74";
            }
        } else {
            this.bgColors[i] = "ffffff";
            if (this.tables[j] === this.tables[j - 1]) {
                this.bgColors[i - 1] = "ffffff";
            }
        }
        if (this.isBesetzt[h] == true) {
            this.isBesetzt[h] = false;
        } else {
            this.isBesetzt[h] = true;
        }

    }

    showSonnbergZirbn() {
        console.log("Hoi!");

        this.topValues = [340, 220, 140, 200, 280, 280, 200, 140, 220, 340, 430, 370, 280, 280, 320, 260, 200, 140, 140];
        this.leftValues = [630, 630, 600, 570, 570, 510, 510, 400, 400, 400, 200, 200, 230, 170, 50, 50, 50, 50, 200,];
        this.tables = [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];

        if (this.buttonBgColor1 === "eaf3f3") {
            this.buttonBgColor1 = "0a7a74";
            this.buttonBgColor2 = "eaf3f3";
            this.buttonBgColor3 = "eaf3f3";
            this.buttonBgColor4 = "eaf3f3"
        } else {
            this.buttonBgColor1 = "eaf3f3";
        }
        if (this.fontColor1 === "0a7a74") {
            this.fontColor1 = "eaf3f3";
            this.fontColor2 = "0a7a74";
            this.fontColor3 = "0a7a74";
            this.fontColor4 = "0a7a74"
        } else {
            this.fontColor1 = "0a7a74";
        }
    }

    showPanorama() {
        console.log("Hoi!");
        this.topValues =  [440, 440, 440, 440, 440, 440, 440, 340, 280, 220, 160, 160, 220, 280, 340, 340, 280, 220, 160, 340, 280, 220, 160, 160, 220, 280, 340, 400, 460, 520, 580, 640];
        this.leftValues = [220, 280, 340, 400, 460, 520, 580, 580, 580, 580, 580, 460, 460, 460, 460, 340, 340, 340, 340, 220, 220, 220, 220, 60, 60, 60, 60, 60, 60, 60, 60, 60];
        this.tables =     [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89];

        if (this.buttonBgColor2 === "eaf3f3") {
            this.buttonBgColor2 = "0a7a74";
            this.buttonBgColor1 = "eaf3f3";
            this.buttonBgColor3 = "eaf3f3";
            this.buttonBgColor4 = "eaf3f3"
        } else {
            this.buttonBgColor2 = "eaf3f3";
        }
        if (this.fontColor2 === "0a7a74") {
            this.fontColor2 = "eaf3f3";
            this.fontColor1 = "0a7a74";
            this.fontColor3 = "0a7a74";
            this.fontColor4 = "0a7a74"
        } else {
            this.fontColor2 = "0a7a74";
        }
    }

    showRestaurant() {
        console.log("Hoi!");
        this.topValues =  [500, 500, 500, 500, 350, 350, 350, 200, 200, 200, 200, 200, 300, 400, 500, 500, 350 ];
        this.leftValues = [60, 120, 180, 240, 120, 180, 240, 60, 180, 240, 340, 440, 440, 440, 440, 340, 340 ];
        this.tables =     [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
        if (this.buttonBgColor3 === "eaf3f3") {
            this.buttonBgColor3 = "0a7a74";
            this.buttonBgColor1 = "eaf3f3";
            this.buttonBgColor2 = "eaf3f3";
            this.buttonBgColor4 = "eaf3f3"
        } else {
            this.buttonBgColor3 = "eaf3f3";
        }
        if (this.fontColor3 === "0a7a74") {
            this.fontColor3 = "eaf3f3";
            this.fontColor1 = "0a7a74";
            this.fontColor2 = "0a7a74";
            this.fontColor4 = "0a7a74"
        } else {
            this.fontColor3 = "0a7a74";
        }
    }

    showWintergarten() {
        console.log("Hoi!");
        this.topValues =  [115, 115, 115, 115, 215, 215, 420, 460, 530, 530, 460, 420, 350, 420, 380, 380, 290, 280, 230, 180, 130, 130, 180, 115, 180];
        this.leftValues = [420, 500, 590, 680, 590, 690, 590, 640, 630, 560, 530, 400, 340, 340, 280, 200, 150, 110, 70, 50, 40, 150, 260, 300, 330 ];
        this.tables =     [501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525];
        if (this.buttonBgColor4 === "eaf3f3") {
            this.buttonBgColor4 = "0a7a74";
            this.buttonBgColor1 = "eaf3f3";
            this.buttonBgColor2 = "eaf3f3";
            this.buttonBgColor3 = "eaf3f3"
        } else {
            this.buttonBgColor4 = "eaf3f3";
        }
        if (this.fontColor4 === "0a7a74") {
            this.fontColor4 = "eaf3f3";
            this.fontColor1 = "0a7a74";
            this.fontColor2 = "0a7a74";
            this.fontColor3 = "0a7a74"
        } else {
            this.fontColor4 = "0a7a74";
        }
    }

    moveTable(g, j) {
        console.log("HELLO");
        console.log(j);

        if (g === 0 && this.topValues[g] === 430) {
            this.topValues[g] = 400;
            this.tables.splice(j + 1, 1, 50);

            console.log(this.tables)

        } else if (g === 0 && this.topValues[g] === 400) {
            this.topValues[g] = 430;
            this.tables.splice(j + 1, 1, 51);
        }
    }
}