import { Component } from '@angular/core';
import { createWorker } from 'tesseract.js';
//import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/camera';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  //worker: Tesseract.Worker;
  workerReady = false;
  image = 'https://tesseract.projectnaptha.com/img/eng_bw.png';
  imageUrl = 'assets/firebase.png';
  ocrResult = '';
  captureProgress = 0;
  worker:any;

  text: any;

  keywords: string[] = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];

  result: any;
  // @ts-ignore
  apiKey: string;
  // @ts-ignore
  authDomain: string;
  // @ts-ignore
  projectId: string;
  // @ts-ignore
  storageBucket: string;
  // @ts-ignore
  messagingSenderId: string;
  // @ts-ignore
  appId: string;


  constructor() {

    this.loadWorker();
  }

  async loadWorker() {
    this.worker = await createWorker({
      logger: progress => {
        console.log(progress);
        if (progress.status == 'recognizing text') {
          this.captureProgress = parseInt('' + progress.progress * 100);
        }
      },
    });

    //await worker.load();
    await this.worker.loadLanguage('eng');
    await this.worker.initialize('eng');
    console.log('finisch');
    this.workerReady = true;
  }

  async captureImage() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.DataUrl,
      //source: CameraSource.Camera
    });

    if (image.dataUrl != null) {
      this.imageUrl = image.dataUrl;
    }
  }

  parseText() {
    const firebaseConfig: any = {};
    const lines = this.text.split('\n');
    lines.forEach((line:string) => {
      this.keywords.forEach(keyword => {
        const regex = new RegExp(keyword + ':\\s*"([^"]+)"');
        const match = line.match(regex);
        if (match) {
          console.log('Match: ', match);
          firebaseConfig[keyword] = match[1];
        }
      });
    });
    this.result = firebaseConfig;
    console.log('RESULT:', this.result)
  }

  async recognizeImage() {
    const result = await this.worker.recognize(this.imageUrl);
    this.ocrResult = result.data.text;
  }
  saveData(){}

}
