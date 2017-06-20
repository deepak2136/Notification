import { Component } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { Geofence } from '@ionic-native/geofence';
import { LocationTracker } from '../../providers/location-tracker';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  public watch: any;
  public lat: number = 0;
  public lng: number = 0;
  public str: string;

  constructor(public navCtrl: NavController, private geofence: Geofence, private plt: Platform,
    private alertController: AlertController, private localNotifications: LocalNotifications, public locationTracker: LocationTracker) {

    geofence.initialize().then(
      // resolved promise does not return a value
      () => this.addGeofence(),
      (err) => console.log(err)
    )

    this.plt.ready().then((rdy) => {
      this.localNotifications.on('click', (notification, state) => {
        let json = JSON.parse(notification.data);
        let alert = this.alertController.create({
          title: 'notification clicked',
          subTitle: 'hidden data: ' + json.myData
        });
        alert.present();
      });
    });

    this.start();
  }

  start() {
    this.showAlert("starting");
    this.locationTracker.startTracking();
  }

  stop() {
    this.locationTracker.stopTracking();
  }

  showAlert(msg: string){
    let alert = this.alertController.create({
          title: 'alert',
          subTitle: msg
        });
        alert.present();
  }

  private addGeofence() {
    //options describing geofence
    let fence = {
      id: '69ca1b88-6fbe-4e80-a4d4-ff4d3748acdb', //any unique ID
      latitude: 23.186441, //center of geofence radius
      longitude: 72.628663,
      radius: 1000, //radius to edge of geofence in meters
      transitionType: 3, //see 'Transition Types' below
      notification: { //notification settings
        id: 1, //any unique ID
        sound: this.setSound(),
        title: 'You crossed a fence', //notification title
        text: 'You just arrived to Gliwice city center.', //notification body
        openAppOnClick: true //open app when notification is tapped
      }
    }

    this.geofence.addOrUpdate(fence).then(
      () => console.log('Geofence added'),
      (err) => console.log('Geofence failed to add')
    );
  }

  sendNotification() {
    this.localNotifications.schedule({
      id: 1,
      text: 'Single ILocalNotification',
      sound: this.setSound(),
      icon: 'file://assets/icon/ic.ico',
      data: { myData: 'this is a hidden message with notification!' }
    });
  }

  setSound() {
    if (this.plt.is('android')) {
      return 'file://assets/sound/closer.mp3'
    }
  }
}
