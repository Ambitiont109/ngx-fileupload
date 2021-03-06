import { Component, TemplateRef, Input, OnInit, OnDestroy, Inject } from "@angular/core";
import { takeUntil } from "rxjs/operators";
import { Subject } from "rxjs";
import {
    NgxFileUploadValidator,
    NgxFileUploadValidationFn,
    NgxFileUploadOptions,
    NgxFileUploadRequest,
    NgxFileUploadFactory,
    NgxFileUploadStorage,
    NgxFileUploadHeaders
} from "@ngx-file-upload/core";
import { FileUploadItemContext } from "../../upload-item/src/upload-item";
import { NgxFileUploadUiI18nProvider, NgxFileUploadUiI18nCommon, NgxFileUploadUiI18nKey } from "../../i18n";

@Component({
    selector: "ngx-file-upload",
    styleUrls: ["./upload-view.scss"],
    templateUrl: "upload-view.html",
})
export class UploadViewComponent implements OnInit, OnDestroy {

    /**
     * set custom template, will pass through to [NgxFileUploadItem]{@link NgxFileUploadItemComponent.html#itemTpl}
     */
    @Input()
    public itemTemplate: TemplateRef<FileUploadItemContext>;

    @Input()
    public url: string;

    @Input()
    public useFormData = true;

    @Input()
    public formDataName = "file";

    @Input()
    public headers: NgxFileUploadHeaders = null;

    @Input()
    public validator: NgxFileUploadValidator | NgxFileUploadValidationFn;

    @Input()
    public set storage(storage: NgxFileUploadStorage) {
        this.uploadStorage = storage;
        this.uploadStorageSet = true;
    }

    public uploadStorage: NgxFileUploadStorage;

    public uploads: NgxFileUploadRequest[] = [];

    public i18n: NgxFileUploadUiI18nCommon;

    private destroyed$: Subject<boolean> = new Subject();

    private uploadStorageSet = false;

    private uploadOptions: NgxFileUploadOptions;

    public constructor(
        @Inject(NgxFileUploadFactory) private uploadFactory: NgxFileUploadFactory,
        private i18nProvider: NgxFileUploadUiI18nProvider
    ) { }

    public ngOnInit() {

        if (!this.uploadStorage) {
            this.uploadStorage = new NgxFileUploadStorage();
        }

        this.i18n = this.i18nProvider.getI18n<NgxFileUploadUiI18nCommon>(NgxFileUploadUiI18nKey.Common);

        this.uploadOptions = {
            url: this.url,
            formData: {
                enabled: this.useFormData,
                name:    this.formDataName
            },
            headers: this.headers
        };

        this.registerStoreEvents();
    }

    public ngOnDestroy() {
        this.destroyed$.next(true);

        /** we handle our own storage so destroy this one */
        if (!this.uploadStorageSet && this.uploadStorage) {
            this.uploadStorage.destroy();
            this.uploadStorage = null;
        }
    }

    /**
     * files get dropped
     */
    public dropFiles(files: File[]) {
        if (files.length) {
            const uploads = this.uploadFactory.createUploadRequest(
                files, this.uploadOptions, this.validator);

            this.uploadStorage.add(uploads);
        }
    }

    /**
     * register events for store changes
     */
    private registerStoreEvents() {
        this.uploadStorage.change()
            .pipe( takeUntil(this.destroyed$))
            .subscribe({
                next: (uploads) => {
                    this.uploads = uploads;
                }
            });
    }
}
