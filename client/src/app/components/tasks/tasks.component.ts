import { Component } from '@angular/core';
import { TaskService } from '../../services/task.service';
import { Task } from '../../../../Task';
import { Messages } from '../../../../Messages';
import { RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Http, Headers } from '@angular/http';
import { OnInit } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { FlashMessagesService } from 'angular2-flash-messages';


@Component({
    selector: 'tasks',
    templateUrl: 'tasks.component.html',
    styleUrls:['tasks.component.css']
})
export class TasksComponent implements OnInit {
    tasks: Task[];
    sentMessages: Messages[];
    title: string;
    dateGenerated: any;
    filesToUpload: Array<File> = [];

    constructor(private taskService: TaskService, private http:Http, private _flashMessagesService: FlashMessagesService){
        this.taskService.getTasks()
            .subscribe(tasks => {
               this.tasks = tasks;
            });

        this.taskService.getMessages()
            .subscribe(sentMessages => {
                this.sentMessages = sentMessages;
            });
    }

    addTask(event){
        event.preventDefault();
        this.dateGenerated = new Date();
        let newTask = {
            text: this.title,
            date: this.dateGenerated
        };
        console.log(newTask);

        //this.sentMessages.push(newTask);
        //console.log(Messages);

        this.taskService.addTask(newTask)
            .subscribe(Messages => {
                this.sentMessages.push(Messages);
                this.title = "";
            });
    }

    ngOnInit() {
        // 1st parameter is a flash message text
        // 2nd parameter is optional. You can pass object with options.
    }

    upload() {
        const formData: any = new FormData();
        const files: Array<File> = this.filesToUpload;

        formData.append("uploads[]", files[0], files[0]['name']);

        this.http.post('/upload', formData)
        .map(files => files.json()).map(res => this._flashMessagesService.show('Erfolgreich Datei angehängt', { cssClass: 'alert-success', timeout: 10000 }))
            .subscribe(files => console.log('files', files))
    }

    fileChangeEvent(fileInput: any) {
        this.filesToUpload = <Array<File>>fileInput.target.files;
        //this.successMsg = "Hoi" + fileInput.target.files[0]['name'];
        //console.log(this.successMsg);
        //this.product.photo = fileInput.target.files[0]['name'];
    }
/*
    fileChange(event) {
        let fileList: FileList = event.target.files;
        if(fileList.length > 0) {
        let file: File = fileList[0];
        let formData:FormData = new FormData();
        formData.append('uploadFile', file, file.name);
        let headers = new Headers();
        headers.append('enctype', 'multipart/form-data');
        headers.append('Accept', 'application/json');
        let options = new RequestOptions({ headers: headers });
        this.http.post('/hallo', formData, options)
            .map(res => res.json())
            .catch(error => Observable.throw(error))
            .subscribe(
            data => console.log('success'),
            error => console.log(error)
            )
        }

    }
 */
}
