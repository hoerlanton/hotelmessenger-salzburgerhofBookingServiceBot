import { Component, Directive, Input, ElementRef, ViewChild, Renderer } from '@angular/core';
import { TischplanService } from '../../services/tischplan.service';
import { DragulaService } from "ng2-dragula";
import { Guest } from '../../../../Guest';
import { ImHausListe } from '../../../../ImHausListe';
import { AnreiseListe } from '../../../../AnreiseListe';
import { TracesListElement } from '../../../../TracesListElement';
import { Table } from '../../../../Table';
import { BgColor } from '../../../../BgColor';
import { LeftValue } from '../../../../LeftValue';
import { TopValue } from '../../../../TopValue';
import { buttonBgColor } from '../../../../buttonBgColor';
import { IsBesetzt } from '../../../../IsBesetzt';
import { Messages } from '../../../../Messages';
import { TracesListeDataElement } from '../../../../TracesListeDataElement';
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
    tracesListeElemente: TracesListElement[];
    tables: Table[];
    sentMessages: Messages[];
    tracesListeDataElemente: TracesListeDataElement[];
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
            .subscribe(tracesListeElemente  => {
                if (tracesListeElemente) {
                    console.log(tracesListeElemente);
                    console.log("2:" + tracesListeElemente[0].data[0]);
                    console.log(tracesListeElemente[0].data.length);
                    this.tracesListeElemente = tracesListeElemente[0].data;
                    //this.formatTracesListeElements();
                }
            });

        /*
        function filterTracesListeElemente(tracesListeDataElemente) {
            console.log(tracesListeDataElemente);
        }
        */

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

    private formatTracesListeElements() {

        /*
        for (let o = 0; o < this.tracesListeElemente.length; o++) {
            this.tracesListeElemente = this.tracesListeElemente[o].split(',');

            if (this.tracesListeElemente[o].length === 7) {
                this.tracesListeElemente[o].splice(0, 5);
                this.tracesListeElemente[o].splice(6, 7);
            }
            if (this.tracesListeElemente[o].length === 8) {
                this.tracesListeElemente[o].splice(o, 1);
            }
            if (this.tracesListeElemente[o].length > 12) {
                this.tracesListeElemente[o].splice(o, 1);

                //this.tracesListeElemente = this.tracesListeElemente[0].data;
                //if (this.tracesListeElemente[0].data[o].length === 12) {
                //    this.tracesListeElemente[0].data[o].concat(this.tracesListeElemente[0].data[o + 1]);
                //}

            }
        }
        console.log(this.tracesListeElemente);
        */
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

    print(): void {
        let printContents, popupWin;
        printContents = document.getElementById('print-section').innerHTML + document.getElementById('print-section1').innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write(`   
      <html>
        <head>
            <title>Dashboard</title>
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
                <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
                <script src="https://code.jquery.com/jquery-1.12.4.min.js"   integrity="sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ="   crossorigin="anonymous"></script>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.7.1/css/bootstrap-datepicker.css">
                <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.7.1/locales/bootstrap-datepicker.ar.min.js"></script>
                <script src="node_modules/core-js/client/shim.min.js"></script>
                <script src="<your-libs-directory>/object-assign.min.js"></script>
          <style>
          
html, body {
    padding: 0;
    margin: 0;
    height: 100%;
    background-color: #0a7a74;
}

.row {
    height: 100%;
}

.row .container-fluid {
    height: 100%;
}

.row .container-fluid .col-md-4 {
    background-color: #f3efe4;
    padding: 20px 10px 20px 10px;
    border-left: 10px solid #0a7a74;
    border-right: 10px solid #0a7a74;
    height: 100%;
    border-bottom: 20px solid #0a7a74;
    max-width: 20%;
}

.row .container-fluid .col-md-4 .row1 {
    overflow: auto;
    margin: 0 0 0 0;
    display: inline-block;
    width: 100%;
    height: 25%;
    padding-top: 20px;
}

.row .container-fluid .col-md-4 .row1 .wrapper {
    overflow: auto;
    margin: 0 0 0 0;
    display: inline-block;
    max-width: 100%;
}

.row .container-fluid .col-md-4 .row1 .wrapper .container {
    overflow: auto;
    margin: 0 0 0 0;
    display: inline-block;
    max-width: 100%;
}

.row .container-fluid .col-md-4 .row3 {
    margin: 0 auto;
    display: inline-block;
    width: 100%;
      height: 100%;

    padding-top: 20px;
}


.row .container-fluid .col-md-4 .col-xs-12 .row1 {
    overflow: auto;
    margin: 0 auto;
    display: inline-block;
    width: 100%;
    height: 100%;

    padding-top: 20px;
}


.row .container-fluid .col-md-4 h3 {
    align-content: center;
    margin: 0 auto;
    display: inline-block;
    color: #0a7a74;
    position: relative;
    text-align:center;
}

.row .container-fluid .col-md-4 .row3 .col-xs-12 .form-group {
    border-top:3px solid #0a7a74;
    width: 105%;
    padding: 10px 10px 10px 30px;
}

.row .container-fluid .col-md-4 .row3 .col-xs-12  .group {
    border-top:3px solid #0a7a74;
    width: 105%;
    padding: 10px 10px 10px 30px;
}

.row .container-fluid .col-md-4 .row3 .col-xs-12 .form-group1 {
    margin-top: 20px;
    overflow: auto;
    max-height: 300px;
    display: inline-block;
    border-top:3px solid #0a7a74;
    width: 102%;
    padding: 10px 10px 10px 25px;
}

.row1 .col {
    flex: 1;
}

.row1 .col:nth-child(1) {
    order: 1;
}
.row1 .col:nth-child(2) {
    order: 0;
}
.row1 .col:nth-child(3) {
    order: 2;
}

.row .col-md-4 .row2 {
    padding-bottom: 10px;
    position: relative;
    min-height: 100%;
    border-bottom: 1px solid red;
}

.card {
    background: rgb(255,255,255); /* Fall-back for browsers that don support rgba */
    background: rgba(255,255,255, 1);
}

.row .container-fluid .col-md-4 .row1 .wrapper .container .card p {
    padding:10px 10px 10px 10px;
    max-width: 100%;
}

.row .container-fluid .col-md-4 .wrapper .container .card p {
    padding:10px 10px 10px 10px;
    max-width: 100%;
}

.row .container-fluid .col-md-4 .row3 .row1 p {
    padding: 10px 10px 10px 10px;
    background: rgb(255,255,255); /* Fall-back for browsers that don support rgba */
    background: rgba(255,255,255, 1);
    max-width: 100%;
}

.row .container-fluid .col-md-4 .col-xs-12 .row1 .wrapper .container .card p {
    padding: 10px 10px 10px 10px;
    max-width: 100%;
}

.row .container-fluid .col-md-6 {
    height: 620px;
    width: 58%;
    background-color: #eaf3f3;
}

.row .container-fluid .col-md-6 .row {
    background-color: #eaf3f3;
    height: 620px;
}

.row .container-fluid .col-md-6 .row1 .col-md-3 {
    margin: 0px 0px 0px 0px;
    padding: 20px 20px 20px 20px;
}

.row .container-fluid .col-md-6 .row .t1 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t2 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t3 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t4 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t5 {
    width: 30px;
    height: 80px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t6 {
    width: 30px;
    height: 80px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t7 {
    width: 30px;
    height: 80px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t8 {
    width: 100px;
    height: 90px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t9 {
    width: 40px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t10 {
    width: 40px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t11 {
    width: 30px;
    height: 80px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t12 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t13 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t14 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t15 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t16 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t17 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t40 {
    width: 60px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t41 {
    width: 60px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t42 {
    width: 80px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t43 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t44 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t45 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t46 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t47 {
    width: 80px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t48 {
    width: 60px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t49 {
    width: 60px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t50 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t51 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t52 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t53 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t54 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t55 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t56 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t57 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t58 {
    width: 60px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .t60 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t61 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t62 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t63 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t64 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t65 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t66 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t67 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t68 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t69 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t70 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t71 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t72 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t73 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t74 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t75 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t76 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t77 {
     width: 60px;
     height: 30px;
     background-color: #FFFFFF;
     position: absolute;
 }

.row .container-fluid .col-md-6 .row .t78 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}


.row .container-fluid .col-md-6 .row .t79 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t80 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t81 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t82 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t83 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t84 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t85 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row  .t86 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t87 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t88 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t89 {
    width: 60px;
    height: 30px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t501 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t502 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t503 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(45deg);
}

.row .container-fluid .col-md-6 .row .t504 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(45deg);
}

.row .container-fluid .col-md-6 .row .t505 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(45deg);
}

.row .container-fluid .col-md-6 .row .t506 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(45deg);
}

.row .container-fluid .col-md-6 .row .t507 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    border-radius: 50%;
}

.row .container-fluid .col-md-6 .row .t508 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    border-radius: 50%;

}

.row .container-fluid .col-md-6 .row .t509 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    border-radius: 50%;

}

.row .container-fluid .col-md-6 .row .t510 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    border-radius: 50%;

}

.row .container-fluid .col-md-6 .row .t511 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    border-radius: 50%;

}

.row .container-fluid .col-md-6 .row .t512 {
    width: 80px;
    height: 45px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t513 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    border-radius: 50%;

}

.row .container-fluid .col-md-6 .row .t514 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    border-radius: 50%;

}

.row .container-fluid .col-md-6 .row .t515 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(45deg);
}

.row .container-fluid .col-md-6 .row .t516 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(45deg);
}

.row .container-fluid .col-md-6 .row .t517 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(10deg);
}

.row .container-fluid .col-md-6 .row .t518 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(30deg);
}

.row .container-fluid .col-md-6 .row .t519 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(50deg);
}

.row .container-fluid .col-md-6 .row .t520 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(70deg);
}

.row .container-fluid .col-md-6 .row .t521 {
    width: 30px;
    height: 60px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(90deg);
}

.row .container-fluid .col-md-6 .row .t522 {
    width: 80px;
    height: 45px;
    background-color: #FFFFFF;
    position: absolute;
}

.row .container-fluid .col-md-6 .row .t523 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(45deg);
}

.row .container-fluid .col-md-6 .row .t524 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(45deg);
}

.row .container-fluid .col-md-6 .row .t525 {
    width: 40px;
    height: 40px;
    background-color: #FFFFFF;
    position: absolute;
    transform: rotate(45deg);
}

</style>
        </head>
            <body onload="window.print();window.close()">${printContents}</body>
      </html>`
        );
        popupWin.document.close();
    }
}