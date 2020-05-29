import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import * as cornerstone from 'cornerstone-core';
import * as cornerstonetools from 'cornerstone-tools';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

// cornerstoneWADOImageLoader.external.cornerstone = cornerstone;


@Component({
  selector: 'app-dicom-viewer',
  templateUrl: './dicom-viewer.component.html',
  styleUrls: ['./dicom-viewer.component.scss'],
})
export class DicomViewerComponent implements OnInit {
  @ViewChild('dicom', {static: true}) dicom: ElementRef;
  constructor(private http: HttpClient) { }

  ngOnInit() {
    // this.getData().subscribe(data => {
    this.dicomInit();
    // });
  }

  dicomInit() {
    const element = this.dicom.nativeElement;
    const imageId = 'https://tools.cornerstonejs.org/examples/assets/dicom/exotic/1.dcm';
    cornerstone.registerImageLoader('myCustomLoader', this.loadImage);

    cornerstone.enable(element);
    cornerstone.loadImage('myCustomLoader:~' + imageId).then((image) => {
      cornerstone.displayImage(element, image);

      // Enable our tools
      // cornerstonetools.mouseInput.enable(element);
      // cornerstonetools.mouseWheelInput.enable(element);
      // cornerstonetools.wwwc.activate(element, 1); // Left Click
      // cornerstonetools.pan.activate(element, 2); // Middle Click
      // cornerstonetools.zoom.activate(element, 4); // Right Click
      // cornerstonetools.zoomWheel.activate(element); // Mouse Wheel
    });
  }

  getData(): Observable<any> {
    return this.http.get('assets/tensorflowjs/test/0015.DCM');
  }

  loadImage(imageId) {
    // Parse the imageId and return a usable URL (logic omitted)
    const url = imageId.split('~')[1];
    console.log('custom', imageId, url);

    // Create a new Promise
    const promise = new Promise((resolve, reject) => {
      // Inside the Promise Constructor, make
      // the request for the DICOM data
      const oReq = new XMLHttpRequest();
      oReq.open('get', url, true);
      oReq.responseType = 'arraybuffer';
      oReq.onreadystatechange = (oEvent) => {
          if (oReq.readyState === 4) {
              if (oReq.status === 200) {
                console.log('oReq.response', oReq.response);
                  // Request succeeded, Create an image object (logic omitted)
                const image = new Image(400, 500);
                // image.data oReq.response
                // image.get

                // Return the image object by resolving the Promise
                resolve(image);
              } else {
                  // An error occurred, return an object containing the error by
                  // rejecting the Promise
                  reject(new Error(oReq.statusText));
              }
          }
      };

      oReq.send();
    });

    // Return an object containing the Promise to cornerstone so it can setup callbacks to be
    // invoked asynchronously for the success/resolve and failure/reject scenarios.
    return {
      promise
    };
}

}
