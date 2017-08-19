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
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var core_2 = require("@angular/core");
var tischplan_service_1 = require("../../services/tischplan.service");
var ng2_dragula_1 = require("ng2-dragula");
var http_1 = require("@angular/http");
require("rxjs/add/operator/map");
require("rxjs/add/operator/catch");
var angular2_flash_messages_1 = require("angular2-flash-messages");
var TischplanComponent = (function () {
    function TischplanComponent(tischplanService, http, _flashMessagesService, dragulaService, element) {
        var _this = this;
        this.tischplanService = tischplanService;
        this.http = http;
        this._flashMessagesService = _flashMessagesService;
        this.dragulaService = dragulaService;
        this.element = element;
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
        this.tischplanService.getGuests()
            .subscribe(function (guests) {
            _this.guests = guests;
        });
        this.tischplanService.getMessages()
            .subscribe(function (sentMessages) {
            _this.sentMessages = sentMessages;
        });
        this.tischplanService.getScheduledMessages()
            .subscribe(function (scheduledMessages) {
            _this.scheduledMessages = scheduledMessages;
        });
        //92
        this.tables = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523, 524, 525];
        this.bgColors = ['ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff', 'ffffff'];
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
        //Check if one of the elements with the id #container has a element with the id #card as child element
        var containerElements = DomBaseElement.querySelectorAll('.container a');
        //console.log("ContainerElements:");
        //console.log(containerElements);
        console.log(containerElements.length);
        for (var i = 0; i < containerElements.length; i++) {
            if (containerElements[i].hasChildNodes("#card") != null) {
                //if so change the background color of this element
                //console.log(document.getElementsByClassName('.container'));
                //console.log(DomBaseElement.querySelector('.container').querySelector('.table'));
                var wrapperElements = DomBaseElement.querySelectorAll('.wrapper a');
                var wrapperElementsLength = document.getElementById("wrapper").childNodes.length;
                var wrapperElementsNames = document.getElementById("wrapper").childNodes;
                console.log("WrapperElements:");
                console.log(wrapperElements);
                console.log(wrapperElementsLength);
                console.log(wrapperElementsNames);
                //console.log(document.getElementById("container").childNodes);
                for (var j = 0; j < wrapperElementsLength; j++) {
                    wrapperElementsChildNames.push(wrapperElementsNames.item(j));
                    //wrapperElementsChildNames.push(wrapperElementsNames[j].childNodes);
                    //console.log(wrapperElementsChildNames[j]);
                    if (wrapperElementsChildNames[j].childNodes.length < 10) {
                        console.log(wrapperElementsChildNames[j].childNodes.length);
                        this.bgColors[j] = "0a7a74";
                    }
                    //console.log(wrapperElementsChildNames);
                    //console.log(wrapperElementsChildNames[j].item(2));
                    //if (wrapperElementsNames[j].childNodes ) {
                    //       this.bgColors[j] = "0a7a74";
                    //   }
                    //if (wrapperElementsChildNames.childNodes("#card") != null) {
                    //   this.bgColors[j] = "0a7a74";
                    //}
                }
                //if (document.getElementById("container").childNodes[j] != null) {
                //}
            }
        }
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
    return TischplanComponent;
}());
TischplanComponent = __decorate([
    core_1.Component({
        selector: 'tischplan',
        templateUrl: 'tischplan.component.html',
        styleUrls: ['tischplan.component.css'],
    }),
    __metadata("design:paramtypes", [tischplan_service_1.TischplanService, http_1.Http, angular2_flash_messages_1.FlashMessagesService, ng2_dragula_1.DragulaService, core_2.ElementRef])
], TischplanComponent);
exports.TischplanComponent = TischplanComponent;
// html file deleted:
// {{"Kann zahlen: " + guest.is_payment_enabled}} 
//# sourceMappingURL=tischplan.component.js.map