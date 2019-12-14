# ngx file upload / core

![](https://github.com/r-hannuschka/ngx-fileupload/workflows/ngx-file-upload/core/badge.svg?branch=development)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/dc2f1a553c31471a95184d397bf72eb3)](https://www.codacy.com/app/r-hannuschka/ngx-fileupload?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=r-hannuschka/ngx-fileupload&amp;utm_campaign=Badge_Grade)
[![DeepScan grade](https://deepscan.io/api/teams/6017/projects/7879/branches/86957/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=6017&pid=7879&bid=86957)
[![codecov](https://codecov.io/gh/r-hannuschka/ngx-fileupload/branch/master/graph/badge.svg)](https://codecov.io/gh/r-hannuschka/ngx-fileupload)
[![dependencies Status](https://david-dm.org/r-hannuschka/ngx-fileupload/status.svg?path=src)](https://david-dm.org/r-hannuschka/ngx-fileupload?path=src)

Angular 8 file upload core dateien für asynchronen datei upload. Dieses Package enthält keine UI Komponenten um möglichst klein zu bleiben und die Freiheit zu gewährleisten die gesammte Oberfläche selbst zu gestalten ohne den Overhead von Styles, Bildern und Fonts mit zu bringen welcher gear nicht benötigt wird.

## @Install

```bash
npm i --save @ngx-file-upload/core
```

## @Example

This example uses ngx-dropzone module which also provides some ui components for a drop zone and preview. We could simply use this and put our own stuff on top of this.

- only 2 Uploads on same time all other will queued
- all uploads will persist in storage, so we have an provider we could on other components to get current uploads.
- uploads will start automatically if they put into queue
- uploads will removed automatically after 5 seconds if they completed

### app.module.ts

```ts
import { BrowserModule } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { NgModule, Provider } from "@angular/core";
import { NgxFileUploadCoreModule } from "@ngx-file-upload/core";
import { NgxDropzoneModule } from "ngx-dropzone";

import { AppComponent } from "./app.component";

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        // app module
        CommonModule
        NgxDropzoneModule,
        NgxFileUploadCoreModule,
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
```

---

### app.component.ts

```ts
import { Component, OnInit, Inject } from '@angular/core';
import { UploadStorage, NgxFileUploadFactory, UploadOptions, UploadRequest } from "@ngx-file-upload/core";

@Component({
    selector: "app-component",
    templateUrl: "./app.component.html",
    styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {

    public uploads: UploadRequest[] = [];

    private storage: UploadStorage;

    private uploadOptions: UploadOptions;

    constructor(
      @Inject(NgxFileUploadFactory) private uploadFactory: NgxFileUploadFactory
    ) {
        this.storage = new UploadStorage({
          concurrentUploads: 2,
          autoStart: true,
          removeCompleted: 5000 // remove completed after 5 seconds
        });

        this.uploadOptions = {url: "http://localhost:3000/upload"};
    }

    ngOnInit() {
      this.storage.change()
        .subscribe(uploads => this.uploads = uploads);
    }
 
    public onSelect(event) {
      const addedFiles: File[] = event.addedFiles;

      if (addedFiles.length) {
        const uploads = this.uploadFactory.createUploadRequest(addedFiles, this.uploadOptions);
        this.storage.add(uploads);
      }
    }
     
    public onRemove(upload: UploadRequest) {
      this.storage.remove(upload);
    }
}
```

---

### app.component.html
```html
<ngx-dropzone (change)="onSelect($event)">
	<ngx-dropzone-label>Drop or Browse</ngx-dropzone-label>
	<ngx-dropzone-image-preview ngProjectAs="ngx-dropzone-preview" *ngFor="let upload of uploads"
		(removed)="onRemove(upload)" 
		[file]="upload.file.raw"
        [removable]="true">

        <ngx-dropzone-label>
            Name: {{ upload.file.name }}<br />
            State: {{upload.file.state}}<br />
            Progress: {{upload.file.progress}} %
        </ngx-dropzone-label>

    </ngx-dropzone-image-preview>
</ngx-dropzone>
```

## @Demo

[Demo](https://r-hannuschka.github.io/ngx-fileupload/#/) can be found here.

## @Docs

|Name          | Short Description                                                         | Docs                                                                                               |
|--------------|---------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
|API| all interfaces   | [API](https://github.com/r-hannuschka/ngx-fileupload/blob/master/docs/api.md)|
|Upload Storage| simple upload storage which holds all upload requests and controls them   | [Upload Storage](https://github.com/r-hannuschka/ngx-fileupload/blob/master/docs/upload.storage.md)|
|Upload Factory| factory to create new upload requests which can added to upload storage   | [Upload Factory](https://github.com/r-hannuschka/ngx-fileupload/blob/master/docs/factory.md) | 
|Upload Queue  | part of upload storage and controls how many uploads run at the same time | - |
|Validation    | Validation Classes for upload requests                                    | [Vaidation](https://github.com/r-hannuschka/ngx-fileupload/blob/master/docs/validation.md)|


## @Credits

Special thanks for code reviews, great improvements and ideas to

||||  
|:-:|:-:|:-:|
|[![alt Konrad Mattheis](https://avatars2.githubusercontent.com/u/1100969?s=60&v=4)](https://github.com/konne)<br />Konrad Mattheis| [<img src="https://avatars3.githubusercontent.com/u/17725886?s=60&v=4" width=60 alt="Thomas Haenig" />](https://github.com/thomashaenig)<br />Thomas Haenig| [![alt Alexander Görlich](https://avatars0.githubusercontent.com/u/13659581?s=60&v=4)](https://github.com/AlexanderGoerlich)  <br />Alexander Görlich|

## Author

Ralf Hannuschka [Github](https://github.com/r-hannuschka)

## Other Modules

- [ngx-responsivemenu](https://github.com/r-hannuschka/ngx-responsivemenu)
