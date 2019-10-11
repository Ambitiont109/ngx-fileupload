import { Component, TemplateRef, Input } from "@angular/core";
import { delay } from "rxjs/operators";
import { of } from "rxjs";

import { Upload } from "../../data/api/upload";
import { FileUploadItemContext } from "@lib/ui";
import { Validator, ValidationFn } from "@lib/data/api/validation";

/**
 * NgxFileUploadComponent is a wrapper contain NgxFileUploadDirective and NgxFileUploadComponent
 * to setup a upload view very quickly. All options will passed directly to NgxFileUploadDirective
 * or NgxFileUploadComponent. This component simply handle all events / changes from upload.
 *
 * @example
 * <!-- base implementation //-->
 * <ngx-fileupload [url]="'http://localhost:3000/upload'"></ngx-fileupload>
 *
 *
 * @example
 * <!-- define custom template which will be used for visual representation for one upload //-->
 * <ng-template #myItemTemplate let-uploadData="data" let-uploadCtrl="ctrl">
 *    <span>{{uploadData.name}}</span>
 * </ng-template>
 *
 * <ngx-fileupload [url]="'...'" [itemTemplate]="myItemTemplate"></ngx-fileupload>
 *
 *
 * @example
 * <!-- send file without wrapping it into FormData //-->
 * <ngx-fileupload [url]="'...'" [useFormData]="false"></ngx-fileupload>
 */
@Component({
    selector: "ngx-fileupload",
    styleUrls: ["./upload-view.scss"],
    templateUrl: "upload-view.html"
})
export class UploadViewComponent {

    /**
     * set custom template, will pass through to [NgxFileUploadItem]{@link NgxFileUploadItemComponent.html#itemTpl}
     */
    @Input()
    public itemTemplate: TemplateRef<FileUploadItemContext>;

    /**
     * input which url should be used to upload files,
     * this field is mandatory
     */
    @Input()
    public url: string;

    /**
     * by default files will send through FormData Object, if set to false file will send plain into
     * post body
     */
    @Input()
    public useFormData = true;

    /**
     * set field name for FormData Object where to find the file
     */
    @Input()
    public formDataName = "file";

    /**
     * set validator
     */
    @Input()
    public validator: Validator | ValidationFn;

    /**
     * all uploads which has been added in [NgxFileUploadDirective]{@link ../directives/NgxFileUploadDirective.html#add}
     */
    public uploads: Upload[] = [];

    /**
     * flag list
     */
    public showList = false;

    /**
     * new uploads has been added we need to care about this to remove
     * finished uploads from list
     */
    public onUploadsAdd(uploads: Upload[]) {
        this.uploads.push(...uploads);
        this.showList = this.uploads.length > 0;
    }

    /**
     * if state is canceled or uploaded remove it
     */
    public onUploadCompleted(upload: Upload) {
        this.removeUpload(upload);
    }

    /**
     * remove upload from list but wait for 1 sec before it will be removed
     */
    private removeUpload(upload: Upload) {
        of(upload).pipe(delay(1000))
            .subscribe({
                next: () => {
                    const idx = this.uploads.indexOf(upload);
                    this.uploads.splice(idx, 1);
                    this.showList = this.uploads.length > 0;
                }
            });
    }
}