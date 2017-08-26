"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
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
            _this.tracesListeElemente = tracesListeElemente;
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
    return TischplanComponent;
}());
__decorate([
    core_1.ViewChild('myTable')
], TischplanComponent.prototype, "input", void 0);
TischplanComponent = __decorate([
    core_1.Component({
        selector: 'tischplan',
        templateUrl: 'tischplan.component.html',
        styleUrls: ['tischplan.component.css'],
    })
], TischplanComponent);
exports.TischplanComponent = TischplanComponent;
