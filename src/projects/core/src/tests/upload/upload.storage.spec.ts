import { UploadStorage, UploadState } from "@ngx-file-upload/dev/core/public-api";
import { UploadRequestMock, UploadModel } from "@ngx-file-upload/testing";
import { take, takeWhile, tap, auditTime } from "rxjs/operators";

describe("@ngx-file-upload/core/upload.storage", () => {

    let storage: UploadStorage;

    beforeEach(() => {
        storage = new UploadStorage();
        storage.change();
    });

    it ("should add single upload", (done) => {
        const fileUpload = new UploadModel();
        const uploadRequest = new UploadRequestMock(fileUpload);

        storage.change()
            .pipe(take(1))
            .subscribe({
                next: (requests) => expect(requests).toEqual([uploadRequest]),
                complete: () => done()
            });

        storage.add(uploadRequest);
    });

    it ("should add multiple uploads at once", (done) => {

        const fileUpload = new UploadModel();
        const uploadRequest1 = new UploadRequestMock(fileUpload);
        const uploadRequest2 = new UploadRequestMock(fileUpload);

        storage.change()
            .pipe(take(1))
            .subscribe({
                next: (requests) => expect(requests).toEqual([uploadRequest1, uploadRequest2]),
                complete: () => done()
            });

        storage.add([uploadRequest1, uploadRequest2]);
    });

    it ("should not add same request twice", (done) => {

        const fileUpload = new UploadModel();
        const uploadRequest1 = new UploadRequestMock(fileUpload);

        storage.change()
            .pipe(take(1))
            .subscribe({
                next: (requests) => expect(requests).toEqual([uploadRequest1]),
                complete: () => done()
            });

        storage.add([uploadRequest1, uploadRequest1]);
    });

    it ("should remove request", (done) => {
        const fileUpload = new UploadModel();
        const uploadRequest1 = new UploadRequestMock(fileUpload);
        const uploadRequest2 = new UploadRequestMock(fileUpload);

        spyOn(uploadRequest1, "destroy").and.callFake(() => uploadRequest1.destroy$.next(true));

        storage.change()
            .pipe(auditTime(20))
            .subscribe({
                next: (requests) => (expect(requests).toEqual([uploadRequest2]), done()),
            });

        storage.add([uploadRequest1, uploadRequest2]);
        storage.remove(uploadRequest1);
    });

    it ("should remove request by request id", (done) => {
        const fileUpload = new UploadModel();
        const uploadRequest1 = new UploadRequestMock(fileUpload);
        const uploadRequest2 = new UploadRequestMock(fileUpload);

        spyOn(uploadRequest1, "destroy").and.callFake(() => uploadRequest1.destroy$.next(true));

        storage.change()
            .pipe(auditTime(20))
            .subscribe({
                next: (requests) => (expect(requests).toEqual([uploadRequest2]), done()),
            });

        storage.add([uploadRequest1, uploadRequest2]);
        storage.remove(uploadRequest1.requestId);
    });

    it ("should remove invalid and completed requests", (done) => {
        const fileUpload1 = new UploadModel();
        const fileUpload2 = new UploadModel();
        const fileUpload3 = new UploadModel();

        const uploadRequest1 = new UploadRequestMock(fileUpload1);
        const uploadRequest2 = new UploadRequestMock(fileUpload2);
        const uploadRequest3 = new UploadRequestMock(fileUpload3);

        storage.change()
            .pipe(auditTime(20))
            .subscribe({
                next: (requests) => (expect(requests).toEqual([uploadRequest3]), done()),
            });

        storage.add([uploadRequest1, uploadRequest2, uploadRequest3]);

        fileUpload1.state = UploadState.INVALID;
        fileUpload2.state = UploadState.COMPLETED;

        storage.purge();
    });

    it ("should start all idle uploads", (done) => {
        const fileUpload1 = new UploadModel();
        const fileUpload2 = new UploadModel();
        const fileUpload3 = new UploadModel();

        const uploadRequest1 = new UploadRequestMock(fileUpload1);
        const uploadRequest2 = new UploadRequestMock(fileUpload2);
        const uploadRequest3 = new UploadRequestMock(fileUpload3);

        const startSpyUR1 = spyOn(uploadRequest1, "start").and.callFake(() => void 0);
        const startSpyUR2 = spyOn(uploadRequest2, "start").and.callFake(() => uploadRequest2.change$.next(uploadRequest2.file));
        const startSpyUR3 = spyOn(uploadRequest3, "start").and.callFake(() => uploadRequest3.change$.next(uploadRequest3.file));

        storage.change()
            .pipe(auditTime(20))
            .subscribe({
                next: () => {
                    expect(startSpyUR1).not.toHaveBeenCalled();
                    expect(startSpyUR2).toHaveBeenCalled();
                    expect(startSpyUR3).toHaveBeenCalled();
                    done();
                }
            });

        fileUpload1.state = UploadState.PENDING;
        storage.add([uploadRequest1, uploadRequest2, uploadRequest3]);
        storage.startAll();
    });

    it ("should remove only invalid uploads", (done) => {
        const fileUpload1 = new UploadModel();
        const fileUpload2 = new UploadModel();

        const uploadRequest1 = new UploadRequestMock(fileUpload1);
        const uploadRequest2 = new UploadRequestMock(fileUpload2);

        storage.change()
            .pipe(auditTime(20))
            .subscribe({
                next: (requests) => (expect(requests).toEqual([uploadRequest2]), done())
            });

        storage.add([uploadRequest1, uploadRequest2]);

        fileUpload1.state = UploadState.INVALID;
        storage.removeInvalid();
    });

    it ("should not register to changes of invalid uploads", (done) => {
        const fileUpload1 = new UploadModel();
        const uploadRequest1 = new UploadRequestMock(fileUpload1);
        uploadRequest1.requestId = "dontRegisterToInvalid";

        const changeSpy = jasmine.createSpy("change triggerd");

        storage.change()
            .pipe(
                tap(() => changeSpy()),
                takeWhile((requests) => requests.length > 0)
            )
            .subscribe({
                next: () => {
                    expect(changeSpy).toHaveBeenCalledTimes(1);
                    done();
                }
            });

        fileUpload1.state = UploadState.INVALID;
        storage.add([uploadRequest1]);
        uploadRequest1.change$.next();
        uploadRequest1.destroy();
    });

    it ("should start uploads automatically", (done) => {

        const autoStartStorage = new UploadStorage({
            concurrentUploads: 1,
            autoStart: true
        });

        const fileUpload1 = new UploadModel();
        const uploadRequest1 = new UploadRequestMock(fileUpload1);

        autoStartStorage.change()
            .pipe(auditTime(20))
            .subscribe({
                next: () => {
                    expect(uploadRequest1.isProgress()).toBeTruthy();
                    done();
                }
            });

        autoStartStorage.add(uploadRequest1);
    });

    it ("should remove completed uploads after 1 second", (done) => {

        const autoStartStorage = new UploadStorage({
            concurrentUploads: 1,
            autoStart: false,
            removeCompleted: 1000
        });

        const fileUpload = new UploadModel();
        const uploadRequest = new UploadRequestMock(fileUpload);

        autoStartStorage.change()
            .pipe(auditTime(1200))
            .subscribe({
                next: (req: UploadRequestMock[]) => {
                    expect(req).toEqual([]),
                    autoStartStorage.destroy();
                    done();
                }
            });

        autoStartStorage.add(uploadRequest);
        uploadRequest.file.state = UploadState.COMPLETED;
        uploadRequest.applyChange();
    });
});