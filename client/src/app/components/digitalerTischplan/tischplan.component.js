"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var tischplan_service_1 = require('../../services/tischplan.service');
var ng2_dragula_1 = require("ng2-dragula");
var http_1 = require('@angular/http');
require('rxjs/add/operator/map');
require('rxjs/add/operator/catch');
var angular2_flash_messages_1 = require('angular2-flash-messages');
var TischplanComponent = (function () {
    function TischplanComponent(tischplanService, http, _flashMessagesService, dragulaService, element, renderer) {
        var _this = this;
        this.tischplanService = tischplanService;
        this.http = http;
        this._flashMessagesService = _flashMessagesService;
        this.dragulaService = dragulaService;
        this.element = element;
        this.renderer = renderer;
        this.filesToUpload = [];
        this.scheduledDate = new Date(2016, 5, 10);
        this.datepickerOpts = {
            startDate: new Date(2016, 5, 10),
            autoclose: true,
            todayBtn: 'linked',
            todayHighlight: true,
            assumeNearbyYear: true,
            format: 'D, d MM yyyy'
        };
        var DomBaseElement = this.element.nativeElement;
        var wrapperElementsChildNames = [];
        this.tischplanService.getImHausListe()
            .subscribe(function (imHausListeElemente) {
            _this.imHausListeElemente = imHausListeElemente;
        });
        this.tischplanService.getAnreiseListe()
            .subscribe(function (anreiseListeElemente) {
            _this.anreiseListeElemente = anreiseListeElemente;
        });
        this.tischplanService.getTracesListe()
            .subscribe(function (tracesListeElemente) {
            if (tracesListeElemente) {
                console.log(tracesListeElemente);
                console.log("2:" + tracesListeElemente[0].data[0]);
                console.log(tracesListeElemente[0].data.length);
                _this.tracesListeElemente = tracesListeElemente[0].data;
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
        dragulaService.drag.subscribe(function (value) {
            console.log("drag: " + value[0]);
            _this.onDrag(value.slice(1));
        });
        dragulaService.drop.subscribe(function (value) {
            console.log("drop: " + value[0]);
            _this.onDrop(value.slice(1), DomBaseElement, wrapperElementsChildNames);
        });
        dragulaService.over.subscribe(function (value) {
            console.log("over: " + value[0]);
            _this.onOver(value.slice(1));
        });
        dragulaService.out.subscribe(function (value) {
            console.log("out: " + value[0]);
            _this.onOut(value.slice(1));
        });
    }
    TischplanComponent.prototype.formatTracesListeElements = function () {
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
    };
    TischplanComponent.prototype.onDrag = function (args) {
        var e = args[0], el = args[1];
    };
    TischplanComponent.prototype.onDrop = function (args, DomBaseElement, wrapperElementsChildNames) {
        var e = args[0], el = args[1];
        console.log("Args = ");
        console.log(args);
        //Check if one of the elements with the id #container has a element with the id #card as child element
        var containerElements = DomBaseElement.querySelectorAll('.container a');
        console.log("ContainerElements:");
        console.log("Container Elements = ");
        console.log(containerElements);
        console.log(containerElements.length);
    };
    TischplanComponent.prototype.onOver = function (args) {
        var e = args[0], el = args[1], container = args[2];
        // do something
    };
    TischplanComponent.prototype.onOut = function (args) {
        var e = args[0], el = args[1], container = args[2];
        // do something
    };
    TischplanComponent.prototype.clicked = function (event) {
        var _this = this;
        console.log(this.scheduledDate);
        var scheduledMessage = {
            text: this.title,
            date: this.scheduledDate.toString(),
        };
        console.log(scheduledMessage);
        this.tischplanService.scheduleMessage(scheduledMessage)
            .subscribe(function (Messages) {
            _this.scheduledMessages.push(Messages);
            _this.title = '';
        });
    };
    TischplanComponent.prototype.sendMessage = function (event) {
        var _this = this;
        event.preventDefault();
        this.dateGenerated = new Date();
        var newMessage = {
            text: this.title,
            date: this.dateGenerated
        };
        console.log(newMessage);
        this.tischplanService.sendMessage(newMessage)
            .subscribe(function (Messages) {
            _this.sentMessages.push(Messages);
            _this.title = '';
        });
    };
    TischplanComponent.prototype.ngOnInit = function () {
        //this.renderer.invokeElementMethod(this.input.nativeElement, 'focus');
    };
    TischplanComponent.prototype.upload = function () {
        var _this = this;
        var formData = new FormData();
        var files = this.filesToUpload;
        formData.append('uploads[]', files[0], files[0]['name']);
        this.http.post('/upload', formData)
            .map(function (files) { return files.json(); }).map(function (res) {
            // 1st parameter is a flash message text
            // 2nd parameter is optional. You can pass object with options.
            return _this._flashMessagesService.show('Erfolgreich Datei angehängt', { cssClass: 'alert-success', timeout: 10000 });
        })
            .subscribe(function (files) { return console.log('files', files); });
    };
    TischplanComponent.prototype.fileChangeEvent = function (fileInput) {
        this.filesToUpload = fileInput.target.files;
        //this.successMsg = "Hoi" + fileInput.target.files[0]['name'];
        //console.log(this.successMsg);
        //this.product.photo = fileInput.target.files[0]['name'];
    };
    TischplanComponent.prototype.besetzt = function (i, h, j) {
        if (this.bgColors[i] === "ffffff") {
            this.bgColors[i] = "0a7a74";
            if (this.tables[j] === this.tables[j - 1]) {
                this.bgColors[i - 1] = "0a7a74";
            }
        }
        else {
            this.bgColors[i] = "ffffff";
            if (this.tables[j] === this.tables[j - 1]) {
                this.bgColors[i - 1] = "ffffff";
            }
        }
        if (this.isBesetzt[h] == true) {
            this.isBesetzt[h] = false;
        }
        else {
            this.isBesetzt[h] = true;
        }
    };
    TischplanComponent.prototype.showSonnbergZirbn = function () {
        console.log("Hoi!");
        this.topValues = [340, 220, 140, 200, 280, 280, 200, 140, 220, 340, 430, 370, 280, 280, 320, 260, 200, 140, 140];
        this.leftValues = [630, 630, 600, 570, 570, 510, 510, 400, 400, 400, 200, 200, 230, 170, 50, 50, 50, 50, 200,];
        this.tables = [40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58];
        if (this.buttonBgColor1 === "eaf3f3") {
            this.buttonBgColor1 = "0a7a74";
            this.buttonBgColor2 = "eaf3f3";
            this.buttonBgColor3 = "eaf3f3";
            this.buttonBgColor4 = "eaf3f3";
        }
        else {
            this.buttonBgColor1 = "eaf3f3";
        }
        if (this.fontColor1 === "0a7a74") {
            this.fontColor1 = "eaf3f3";
            this.fontColor2 = "0a7a74";
            this.fontColor3 = "0a7a74";
            this.fontColor4 = "0a7a74";
        }
        else {
            this.fontColor1 = "0a7a74";
        }
    };
    TischplanComponent.prototype.showPanorama = function () {
        console.log("Hoi!");
        this.topValues = [440, 440, 440, 440, 440, 440, 440, 340, 280, 220, 160, 160, 220, 280, 340, 340, 280, 220, 160, 340, 280, 220, 160, 160, 220, 280, 340, 400, 460, 520, 580, 640];
        this.leftValues = [220, 280, 340, 400, 460, 520, 580, 580, 580, 580, 580, 460, 460, 460, 460, 340, 340, 340, 340, 220, 220, 220, 220, 60, 60, 60, 60, 60, 60, 60, 60, 60];
        this.tables = [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89];
        if (this.buttonBgColor2 === "eaf3f3") {
            this.buttonBgColor2 = "0a7a74";
            this.buttonBgColor1 = "eaf3f3";
            this.buttonBgColor3 = "eaf3f3";
            this.buttonBgColor4 = "eaf3f3";
        }
        else {
            this.buttonBgColor2 = "eaf3f3";
        }
        if (this.fontColor2 === "0a7a74") {
            this.fontColor2 = "eaf3f3";
            this.fontColor1 = "0a7a74";
            this.fontColor3 = "0a7a74";
            this.fontColor4 = "0a7a74";
        }
        else {
            this.fontColor2 = "0a7a74";
        }
    };
    TischplanComponent.prototype.showRestaurant = function () {
        console.log("Hoi!");
        this.topValues = [500, 500, 500, 500, 350, 350, 350, 200, 200, 200, 200, 200, 300, 400, 500, 500, 350];
        this.leftValues = [60, 120, 180, 240, 120, 180, 240, 60, 180, 240, 340, 440, 440, 440, 440, 340, 340];
        this.tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
        if (this.buttonBgColor3 === "eaf3f3") {
            this.buttonBgColor3 = "0a7a74";
            this.buttonBgColor1 = "eaf3f3";
            this.buttonBgColor2 = "eaf3f3";
            this.buttonBgColor4 = "eaf3f3";
        }
        else {
            this.buttonBgColor3 = "eaf3f3";
        }
        if (this.fontColor3 === "0a7a74") {
            this.fontColor3 = "eaf3f3";
            this.fontColor1 = "0a7a74";
            this.fontColor2 = "0a7a74";
            this.fontColor4 = "0a7a74";
        }
        else {
            this.fontColor3 = "0a7a74";
        }
    };
    TischplanComponent.prototype.showWintergarten = function () {
        console.log("Hoi!");
        this.topValues = [115, 115, 115, 115, 215, 215, 420, 460, 530, 530, 460, 420, 350, 420, 380, 380, 290, 280, 230, 180, 130, 130, 180, 115, 180];
        this.leftValues = [420, 500, 590, 680, 590, 690, 590, 640, 630, 560, 530, 400, 340, 340, 280, 200, 150, 110, 70, 50, 40, 150, 260, 300, 330];
        this.tables = [501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525];
        if (this.buttonBgColor4 === "eaf3f3") {
            this.buttonBgColor4 = "0a7a74";
            this.buttonBgColor1 = "eaf3f3";
            this.buttonBgColor2 = "eaf3f3";
            this.buttonBgColor3 = "eaf3f3";
        }
        else {
            this.buttonBgColor4 = "eaf3f3";
        }
        if (this.fontColor4 === "0a7a74") {
            this.fontColor4 = "eaf3f3";
            this.fontColor1 = "0a7a74";
            this.fontColor2 = "0a7a74";
            this.fontColor3 = "0a7a74";
        }
        else {
            this.fontColor4 = "0a7a74";
        }
    };
    TischplanComponent.prototype.moveTable = function (g, j) {
        console.log("HELLO");
        console.log(j);
        if (g === 0 && this.topValues[g] === 430) {
            this.topValues[g] = 400;
            this.tables.splice(j + 1, 1, 50);
            console.log(this.tables);
        }
        else if (g === 0 && this.topValues[g] === 400) {
            this.topValues[g] = 430;
            this.tables.splice(j + 1, 1, 51);
        }
    };
    TischplanComponent.prototype.print = function () {
        var printContents, popupWin;
        printContents = document.getElementById('print-section').innerHTML + document.getElementById('print-section1').innerHTML;
        popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
        popupWin.document.open();
        popupWin.document.write("   \n      <html>\n        <head>\n            <title>Dashboard</title>\n                <meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no\">\n                <link rel=\"stylesheet\" href=\"https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css\" integrity=\"sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u\" crossorigin=\"anonymous\">\n                <script src=\"https://code.jquery.com/jquery-1.12.4.min.js\"   integrity=\"sha256-ZosEbRLbNQzLpnKIkEdrPv7lOy9C27hHQ+Xp8a4MxAQ=\"   crossorigin=\"anonymous\"></script>\n                <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.7.1/css/bootstrap-datepicker.css\">\n                <script src=\"https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.7.1/locales/bootstrap-datepicker.ar.min.js\"></script>\n                <script src=\"node_modules/core-js/client/shim.min.js\"></script>\n                <script src=\"<your-libs-directory>/object-assign.min.js\"></script>\n          <style>\n          \nhtml, body {\n    padding: 0;\n    margin: 0;\n    height: 100%;\n    background-color: #0a7a74;\n}\n\n.row {\n    height: 100%;\n}\n\n.row .container-fluid {\n    height: 100%;\n}\n\n.row .container-fluid .col-md-4 {\n    background-color: #f3efe4;\n    padding: 20px 10px 20px 10px;\n    border-left: 10px solid #0a7a74;\n    border-right: 10px solid #0a7a74;\n    height: 100%;\n    border-bottom: 20px solid #0a7a74;\n    max-width: 20%;\n}\n\n.row .container-fluid .col-md-4 .row1 {\n    overflow: auto;\n    margin: 0 0 0 0;\n    display: inline-block;\n    width: 100%;\n    height: 25%;\n    padding-top: 20px;\n}\n\n.row .container-fluid .col-md-4 .row1 .wrapper {\n    overflow: auto;\n    margin: 0 0 0 0;\n    display: inline-block;\n    max-width: 100%;\n}\n\n.row .container-fluid .col-md-4 .row1 .wrapper .container {\n    overflow: auto;\n    margin: 0 0 0 0;\n    display: inline-block;\n    max-width: 100%;\n}\n\n.row .container-fluid .col-md-4 .row3 {\n    margin: 0 auto;\n    display: inline-block;\n    width: 100%;\n      height: 100%;\n\n    padding-top: 20px;\n}\n\n\n.row .container-fluid .col-md-4 .col-xs-12 .row1 {\n    overflow: auto;\n    margin: 0 auto;\n    display: inline-block;\n    width: 100%;\n    height: 100%;\n\n    padding-top: 20px;\n}\n\n\n.row .container-fluid .col-md-4 h3 {\n    align-content: center;\n    margin: 0 auto;\n    display: inline-block;\n    color: #0a7a74;\n    position: relative;\n    text-align:center;\n}\n\n.row .container-fluid .col-md-4 .row3 .col-xs-12 .form-group {\n    border-top:3px solid #0a7a74;\n    width: 105%;\n    padding: 10px 10px 10px 30px;\n}\n\n.row .container-fluid .col-md-4 .row3 .col-xs-12  .group {\n    border-top:3px solid #0a7a74;\n    width: 105%;\n    padding: 10px 10px 10px 30px;\n}\n\n.row .container-fluid .col-md-4 .row3 .col-xs-12 .form-group1 {\n    margin-top: 20px;\n    overflow: auto;\n    max-height: 300px;\n    display: inline-block;\n    border-top:3px solid #0a7a74;\n    width: 102%;\n    padding: 10px 10px 10px 25px;\n}\n\n.row1 .col {\n    flex: 1;\n}\n\n.row1 .col:nth-child(1) {\n    order: 1;\n}\n.row1 .col:nth-child(2) {\n    order: 0;\n}\n.row1 .col:nth-child(3) {\n    order: 2;\n}\n\n.row .col-md-4 .row2 {\n    padding-bottom: 10px;\n    position: relative;\n    min-height: 100%;\n    border-bottom: 1px solid red;\n}\n\n.card {\n    background: rgb(255,255,255); /* Fall-back for browsers that don support rgba */\n    background: rgba(255,255,255, 1);\n}\n\n.row .container-fluid .col-md-4 .row1 .wrapper .container .card p {\n    padding:10px 10px 10px 10px;\n    max-width: 100%;\n}\n\n.row .container-fluid .col-md-4 .wrapper .container .card p {\n    padding:10px 10px 10px 10px;\n    max-width: 100%;\n}\n\n.row .container-fluid .col-md-4 .row3 .row1 p {\n    padding: 10px 10px 10px 10px;\n    background: rgb(255,255,255); /* Fall-back for browsers that don support rgba */\n    background: rgba(255,255,255, 1);\n    max-width: 100%;\n}\n\n.row .container-fluid .col-md-4 .col-xs-12 .row1 .wrapper .container .card p {\n    padding: 10px 10px 10px 10px;\n    max-width: 100%;\n}\n\n.row .container-fluid .col-md-6 {\n    height: 620px;\n    width: 58%;\n    background-color: #eaf3f3;\n}\n\n.row .container-fluid .col-md-6 .row {\n    background-color: #eaf3f3;\n    height: 620px;\n}\n\n.row .container-fluid .col-md-6 .row1 .col-md-3 {\n    margin: 0px 0px 0px 0px;\n    padding: 20px 20px 20px 20px;\n}\n\n.row .container-fluid .col-md-6 .row .t1 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t2 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t3 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t4 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t5 {\n    width: 30px;\n    height: 80px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t6 {\n    width: 30px;\n    height: 80px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t7 {\n    width: 30px;\n    height: 80px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t8 {\n    width: 100px;\n    height: 90px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t9 {\n    width: 40px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t10 {\n    width: 40px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t11 {\n    width: 30px;\n    height: 80px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t12 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t13 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t14 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t15 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t16 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t17 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t40 {\n    width: 60px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t41 {\n    width: 60px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t42 {\n    width: 80px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t43 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t44 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t45 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t46 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t47 {\n    width: 80px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t48 {\n    width: 60px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t49 {\n    width: 60px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t50 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t51 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t52 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t53 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t54 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t55 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t56 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t57 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t58 {\n    width: 60px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .t60 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t61 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t62 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t63 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t64 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t65 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t66 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t67 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t68 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t69 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t70 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t71 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t72 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t73 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t74 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t75 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t76 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t77 {\n     width: 60px;\n     height: 30px;\n     background-color: #FFFFFF;\n     position: absolute;\n }\n\n.row .container-fluid .col-md-6 .row .t78 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n\n.row .container-fluid .col-md-6 .row .t79 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t80 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t81 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t82 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t83 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t84 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t85 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row  .t86 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t87 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t88 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t89 {\n    width: 60px;\n    height: 30px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t501 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t502 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t503 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(45deg);\n}\n\n.row .container-fluid .col-md-6 .row .t504 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(45deg);\n}\n\n.row .container-fluid .col-md-6 .row .t505 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(45deg);\n}\n\n.row .container-fluid .col-md-6 .row .t506 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(45deg);\n}\n\n.row .container-fluid .col-md-6 .row .t507 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    border-radius: 50%;\n}\n\n.row .container-fluid .col-md-6 .row .t508 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    border-radius: 50%;\n\n}\n\n.row .container-fluid .col-md-6 .row .t509 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    border-radius: 50%;\n\n}\n\n.row .container-fluid .col-md-6 .row .t510 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    border-radius: 50%;\n\n}\n\n.row .container-fluid .col-md-6 .row .t511 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    border-radius: 50%;\n\n}\n\n.row .container-fluid .col-md-6 .row .t512 {\n    width: 80px;\n    height: 45px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t513 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    border-radius: 50%;\n\n}\n\n.row .container-fluid .col-md-6 .row .t514 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    border-radius: 50%;\n\n}\n\n.row .container-fluid .col-md-6 .row .t515 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(45deg);\n}\n\n.row .container-fluid .col-md-6 .row .t516 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(45deg);\n}\n\n.row .container-fluid .col-md-6 .row .t517 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(10deg);\n}\n\n.row .container-fluid .col-md-6 .row .t518 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(30deg);\n}\n\n.row .container-fluid .col-md-6 .row .t519 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(50deg);\n}\n\n.row .container-fluid .col-md-6 .row .t520 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(70deg);\n}\n\n.row .container-fluid .col-md-6 .row .t521 {\n    width: 30px;\n    height: 60px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(90deg);\n}\n\n.row .container-fluid .col-md-6 .row .t522 {\n    width: 80px;\n    height: 45px;\n    background-color: #FFFFFF;\n    position: absolute;\n}\n\n.row .container-fluid .col-md-6 .row .t523 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(45deg);\n}\n\n.row .container-fluid .col-md-6 .row .t524 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(45deg);\n}\n\n.row .container-fluid .col-md-6 .row .t525 {\n    width: 40px;\n    height: 40px;\n    background-color: #FFFFFF;\n    position: absolute;\n    transform: rotate(45deg);\n}\n\n</style>\n        </head>\n            <body onload=\"window.print();window.close()\">" + printContents + "</body>\n      </html>");
        popupWin.document.close();
    };
    TischplanComponent = __decorate([
        core_1.Component({
            selector: 'tischplan',
            templateUrl: 'tischplan.component.html',
            styleUrls: ['tischplan.component.css'],
        }), 
        __metadata('design:paramtypes', [tischplan_service_1.TischplanService, http_1.Http, angular2_flash_messages_1.FlashMessagesService, ng2_dragula_1.DragulaService, core_1.ElementRef, core_1.Renderer])
    ], TischplanComponent);
    return TischplanComponent;
}());
exports.TischplanComponent = TischplanComponent;
//# sourceMappingURL=tischplan.component.js.map