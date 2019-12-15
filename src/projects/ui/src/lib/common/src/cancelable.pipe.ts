import { Pipe, PipeTransform } from "@angular/core";
import { UploadRequestData, UploadState } from "@ngx-file-upload/core";

/**
 * returns true if an upload could be canceled
 * an upload could canceled if state is one of these: PENDING, START or PROGRESS
 *
 * @example
 * <button [disabled]="!(upload | isCancelAble)">cancel</button>
 */
@Pipe({
    name: "isCancelAble"
})
export class CancelAblePipe implements PipeTransform {

    transform(upload: UploadRequestData): boolean {
        let isCancelAble = upload.state === UploadState.PENDING;
        isCancelAble     = isCancelAble || upload.state === UploadState.START;
        isCancelAble     = isCancelAble || upload.state === UploadState.PROGRESS;
        return isCancelAble;
    }
}
