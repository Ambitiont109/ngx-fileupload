import { NgxFileUploadStorage } from "@ngx-file-upload/core";
import { Observable, of } from "rxjs";

export class UploadStorageMock extends NgxFileUploadStorage {

    public change(): Observable<any> {
        return of([]);
    }

    /**
     * gets notified if queue changes
     */
    public get queueChange(): Observable<any> {
        return of([]);
    }

    public destroy() {}

    /**
     * remove upload from store
     */
    public remove() {}

    /**
     * remove all uploads which has been invalid
     * canceled or upload has been completed even it is has an error
     */
    public purge() {
    }

    public startAll() {}

    public stopAll() {}

    public removeInvalid() {}
}
