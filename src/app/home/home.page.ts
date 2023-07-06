import { Component } from '@angular/core';
import { createWorker } from 'tesseract.js';
//import { Plugins, CameraResultType, CameraSource } from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Filesystem, Directory, Encoding  } from '@capacitor/filesystem';
import {AlertController} from "@ionic/angular";


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
  imageUrl2 = 'assets/firebase2.png';
  ocrResult : any;
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


  constructor( private alertCtrl: AlertController) {

    this.loadWorker();
  }

  async loadWorker() {
    this.worker = await createWorker({
      logger: progress => {
        //console.log(progress);
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

  /*parseTextOCR() {
    this.result = {};
    const regex = /apiKey: "([^"]+)"[\s\S]*authDomain: "([^"]+)"[\s\S]*projectId: "([^"]+)"[\s\S]*storageBucket: "([^"]+)"[\s\S]*messagingSenderId: "([^"]+)"[\s\S]*appId: "([^"]+)"/;
    //const matches = this.text.match(regex);
    const matches = this.ocrResult.match(regex);
    console.log('Match: ', matches);
    console.log('Text: ', this.ocrResult);

    if (matches && matches.length === 7) {
      console.log('if');
      this.keywords.forEach((keyword, index) => {
        this.result[keyword] = matches[index + 1];
      });
    } else {
      // Falls keine Übereinstimmung gefunden wurde, setze das Ergebnis auf null oder zeige eine Fehlermeldung an.
      this.result = null;
    }
    console.log("Result: ", this.result);
    this.saveDataInJson(this.result);
  }*/

  parseTextOCR() {
    //const regex = /apiKey: "([^"]+)"[\s\S]*authDomain: "([^"]+)"[\s\S]/;
    const regex = /apiKey: "([^"]+)"[\s\S]*authDomain: "([^"]+)"[\s\S]*projectId: "([^"]+)"[\s\S]*storageBucket: "([^"]+)"[\s\S]*messagingSenderId: "([^"]+)"[\s\S]*appId: "([^"]+)"/;
    let replace = /”/gi;
    let raplaceOrcResult = this.ocrResult.replace(replace,'"');
    //console.log("Replace Text: ", raplaceOrcResult);
    const matches = raplaceOrcResult.match(regex);
    console.log('Match: ', matches);
    //console.log('Text: ', this.ocrResult);

    if (matches && matches.length === 7) {
      const firebaseConfig = {
        apiKey: matches[1],
        authDomain: matches[2],
        projectId: matches[3],
        storageBucket: matches[4],
        messagingSenderId: matches[5],
        appId: matches[6],
      };
      const data = {
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId,
      };
      this.result = `
             apiKey: "${firebaseConfig.apiKey}",
             authDomain: "${firebaseConfig.authDomain}",
             projectId: "${firebaseConfig.projectId}",
             storageBucket: "${firebaseConfig.storageBucket}",
             messagingSenderId: "${firebaseConfig.messagingSenderId}",
             appId: "${firebaseConfig.appId}"
      `;

      //this.saveDataInJson(data);
      this.showFirebaseSettingData(data);
    } else {
      // Falls keine Übereinstimmung gefunden wurde, setze das Ergebnis auf null oder zeige eine Fehlermeldung an.
      this.result = null;
    }


  }

  parseText() {
    this.result = {};
    const regex = /apiKey: "([^"]+)"[\s\S]*authDomain: "([^"]+)"[\s\S]*projectId: "([^"]+)"[\s\S]*storageBucket: "([^"]+)"[\s\S]*messagingSenderId: "([^"]+)"[\s\S]*appId: "([^"]+)"/;
    const matches = this.text.match(regex);
    console.log('Match: ', matches);
    console.log('Text: ', this.text);

    if (matches && matches.length === 7) {
      this.keywords.forEach((keyword, index) => {
        this.result[keyword] = matches[index + 1];
      });
    } else {
      // Falls keine Übereinstimmung gefunden wurde, setze das Ergebnis auf null oder zeige eine Fehlermeldung an.
      this.result = null;
    }
    console.log("Result: ", this.result);
    this.saveDataInJson(this.result);
  }

  async editData() {
    try {
      const fileName = 'data.json';

      const result = await Filesystem.readFile({
        path: fileName,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      const data = JSON.parse(result.data);
      this.apiKey = data.apiKey;
      this.authDomain = data.authDomain;
      this.projectId = data.projectId;
      this.storageBucket = data.storageBucket;
      this.messagingSenderId = data.messagingSenderId;
      this.appId = data.appId;

    } catch (error) {
      console.error('Error reading data:', error);
    }
  }
  showFirebaseSettingData(data:any){
    this.apiKey = data.apiKey;
    this.authDomain = data.authDomain;
    this.projectId = data.projectId;
    this.storageBucket = data.storageBucket;
    this.messagingSenderId = data.messagingSenderId;
    this.appId = data.appId;
  }
  async createFolder(){
    try {
      const fileName = '/data.json';
      //erstellt ein verzeichnis
      await Filesystem.mkdir({
        path: '/dataOxil',
        directory: Directory.Documents,
        recursive: true // Erstellt auch übergeordnete Verzeichnisse, falls erforderlich
      });

      console.log('Create Folder successfully!');
    } catch (error) {
      console.error('Error Create Folder:', error);
    }
  }

  async createFolder2() {
    try {
      const folderPath = '/dataOxil';
      const parentDir = Directory.Documents;

      // Überprüfe, ob der Ordner bereits existiert
      const folderExists = await Filesystem.stat({
        path: folderPath,
        directory: parentDir
      });

      if (!folderExists || folderExists.type !== 'directory') {
        // Erstelle den Ordner, falls er nicht existiert
        await Filesystem.mkdir({
          path: folderPath,
          directory: parentDir,
          recursive: true
        });
        console.log('Folder created successfully!');
      } else {
        console.log('Folder already exists.');
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  }

  async recognizeImage() {
    const result = await this.worker.recognize(this.imageUrl2);
    this.ocrResult = result.data.text;
    console.log("Picture Result: ", this.ocrResult);

    //await this.saveDataInJson(this.ocrResult);
    this.parseTextOCR();
  }

  async saveDataInJson(data:any) {

    const jsonData = JSON.stringify(data);

    const alert = await this.alertCtrl.create({
      cssClass: 'alt',
      header: 'Firebase Settings Overwrite',
      message: ` Do you want to save new Firebase settings? Old Firebase settings will be <strong>overwriten</strong>!`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'danger',
          handler: () => {

          }
        }, {
          text: 'Overwrite',
          handler: () => {
            try {
              const fileName = '/data.json';

              Filesystem.writeFile({
                path: fileName,
                data: jsonData,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
              });
              this.editData();
              console.log('Data saved successfully!');
            } catch (error) {
              console.error('Error saving data:', error);
            }
          }
        }
      ]
    });
    await alert.present();

  }
  async saveData() {
     const data = {
       apiKey: this.apiKey,
       authDomain: this.authDomain,
       projectId: this.projectId,
       storageBucket: this.storageBucket,
       messagingSenderId: this.messagingSenderId,
       appId: this.appId,
     };

    const jsonData = JSON.stringify(data);

    const alert = await this.alertCtrl.create({
      cssClass: 'alt',
      header: 'Firebase Settings Overwrite',
      message: ` Do you want to save new Firebase settings? Old Firebase settings will be <strong>overwriten</strong>!`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'danger',
          handler: () => {

          }
        }, {
          text: 'Overwrite',
          handler: () => {
            try {
              const fileName = '/data.json';

              Filesystem.writeFile({
                path: fileName,
                data: jsonData,
                directory: Directory.Data,
                encoding: Encoding.UTF8,
              });

              console.log('Data saved successfully!');
            } catch (error) {
              console.error('Error saving data:', error);
            }
          }
        }
      ]
    });
    await alert.present();
  }


}
