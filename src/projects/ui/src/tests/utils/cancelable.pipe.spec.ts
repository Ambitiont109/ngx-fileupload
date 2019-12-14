import { FileUpload, UploadState } from "@ngx-file-upload/core";
import { CancelAblePipe } from "@ngx-file-upload/dev/ui/public-api";
import { UploadModel } from "@ngx-file-upload/testing";

describe("ngx-file-upload/libs/utils/cancelable.pipe", () => {

    let pipe: CancelAblePipe;
    let fileUpload: FileUpload;

    beforeEach(() => {
      pipe = new CancelAblePipe();
      fileUpload = new UploadModel();
    });

    it ("it should be cancelable if state is pending", () => {
        fileUpload.state = UploadState.PENDING;
        const result = pipe.transform(fileUpload);
        expect(result).toBeTruthy();
    });

    it ("it should be cancelable if state is progress", () => {
        fileUpload.state = UploadState.PROGRESS;
        const result = pipe.transform(fileUpload);
        expect(result).toBeTruthy();
    });

    it ("it should be cancelable if state is start", () => {
        fileUpload.state = UploadState.START;
        const result = pipe.transform(fileUpload);
        expect(result).toBeTruthy();
    });

    it ("it should not be cancelable on state canceled, completed, invalid and idle", () => {
        const states = [UploadState.CANCELED, UploadState.COMPLETED, UploadState.INVALID, UploadState.IDLE];
        const result: boolean[] = states.map((state: UploadState) => {
            fileUpload.state = state;
            return pipe.transform(fileUpload);
        });

        expect(result).toEqual([false, false, false, false]);
    });
  });