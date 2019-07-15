import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { Subject, BehaviorSubject, Observable } from "rxjs";
import { takeUntil, filter } from "rxjs/operators";
import { UploadModel, UploadState} from "../model/upload";

/**
 * Upload Options
 */
export interface UploadOptions {

    /**
     * url which should used to upload file
     */
    url: string;

    /**
     * form data options
     */
    formData?: {

        /**
         * if set to false, file will send through post body and not wrapped in
         * FormData Object
         */
        enabled: boolean;
        /**
         * only used if FormData is enabled, defines the name which should used
         * in FormData
         */
        name?: string;
    };
}

/**
 * represents a single file upload
 */
export class FileUpload {

    /**
     * if cancel$ emits true, current upload will stopped
     */
    private cancel$: Subject<boolean> = new Subject();

    /**
     * upload stream to notify observers if something has been changed
     */
    private upload$: BehaviorSubject<UploadModel>;

    private options: UploadOptions = {
        url: "",
        formData: { enabled: true, name: "file" }
    };

    /**
     * create FileUpload service
     */
    public constructor(
        private http: HttpClient,
        private upload: UploadModel,
        options: UploadOptions
    ) {
        this.upload$ = new BehaviorSubject(this.upload);
        this.options = {...this.options, ...options};
    }

    /**
     * upload file to server but only
     * if file is not queued, abort request on cancel
     */
    public start() {
        /** only start upload if state is not queued and is valid */
        if (this.upload.state === UploadState.QUEUED && this.upload.isValid) {
            this.uploadFile().pipe(
                takeUntil(this.cancel$),
                filter(() => this.upload.state !== UploadState.CANCELED)
            )
            .subscribe({
                next: (event: HttpEvent<string>) => this.handleHttpEvent(event),
                error: (error: HttpErrorResponse) => this.handleHttpError(error)
            });
        }
    }

    /**
     * restart download again
     * reset state, and reset errors
     */
    public retry() {
        if (this.upload.state === UploadState.ERROR) {
            this.upload.state   = UploadState.QUEUED;
            this.upload.error   = null;
            this.upload.success = null;
            this.upload.message = "";
            this.start();
        }
    }

    /**
     * cancel current file upload, this will complete change subject
     */
    public cancel() {
        let isCancelAble = this.upload.state !== UploadState.CANCELED;
        isCancelAble     = isCancelAble && this.upload.state !== UploadState.UPLOADED;

        if (isCancelAble) {
            this.upload.state = UploadState.CANCELED;
            this.notifyObservers();
            this.cancel$.next(true);
            this.completeUpload();
        }
    }

    /**
     * returns observable which notify if file upload state
     * has been changed
     */
    public get change(): Observable<UploadModel> {
        return this.upload$.asObservable();
    }

    /**
     * returns true if upload contains an error or is invalid
     */
    public hasError(): boolean {
        return this.upload.error;
    }

    /**
     * returns true if validators are set and upload not validated
     */
    public isInvalid(): boolean {
        return this.upload.isValid === false;
    }

    /**
     * build form data and send request to server
     */
    private uploadFile(): Observable<HttpEvent<string>> {

        const uploadBody = this.createUploadBody();
        return this.http.post<string>(this.options.url, uploadBody, {
            reportProgress: true,
            observe: "events"
        });
    }

    /**
     * create upload body which will should be send
     */
    private createUploadBody(): FormData | File {
        if (this.options.formData.enabled) {
            const formData = new FormData();
            const label    = this.options.formData.name;
            formData.append(label, this.upload.file, this.upload.fileName);
            return formData;
        }
        return this.upload.file;
    }

    /**
     * handle all http events
     */
    private handleHttpEvent(event: HttpEvent<string>) {
        switch (event.type) {
            case HttpEventType.Sent: this.handleSent(); break;
            case HttpEventType.UploadProgress: this.handleProgress(event); break;
            case HttpEventType.Response: this.handleResponse(event); break;
        }
    }

    /**
     * got http error, this not completes the upload
     * since the user can try do the same upload again
     */
    private handleHttpError(error: HttpErrorResponse) {
        this.upload.state = UploadState.ERROR;
        this.upload.error = true;
        this.upload.message = error.message;
        this.notifyObservers();
    }

    /**
     * handle file upload in progress
     */
    private handleProgress(event: HttpProgressEvent) {
        this.upload.state = UploadState.PROGRESS;
        this.upload.uploaded = event.loaded;
        this.notifyObservers();
    }

    /**
     * upload has been started
     */
    private handleSent() {
        this.upload.state = UploadState.START;
        this.notifyObservers();
    }

    /**
     * upload has been completed
     */
    private handleResponse(res: HttpResponse<any>) {

        this.upload.state   = UploadState.UPLOADED;
        this.upload.success = res.ok;
        this.upload.response = {
            code: res.status,
            body: res.body
        };

        this.notifyObservers();
        this.completeUpload();
    }

    /**
     * complete download, complete streams and delete them
     * notify observers
     */
    private completeUpload() {
        this.upload$.complete();
        this.cancel$.complete();
        this.cancel$ = null;
        this.upload$ = null;
    }

    /**
     * send notification to observers
     */
    private notifyObservers() {
        this.upload$.next(this.upload);
    }
}