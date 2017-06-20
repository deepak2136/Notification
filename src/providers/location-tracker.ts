import { Injectable, NgZone } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { ToastController } from 'ionic-angular';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import 'rxjs/add/operator/filter';


@Injectable()
export class LocationTracker {

    public watch: any;
    public lat: number = 0;
    public lng: number = 0;
    public str: string;
    constructor(public zone: NgZone, public backgroundGeolocation: BackgroundGeolocation,
        private localNotifications: LocalNotifications, public geolocation: Geolocation,
        public toastCtrl: ToastController) {

    }

    startTracking() {
        // Background Tracking
        let config = {
            desiredAccuracy: 0,
            stationaryRadius: 20,
            distanceFilter: 10,
            debug: true,
            interval: 2000
        };

        this.backgroundGeolocation.configure(config).subscribe((location) => {
            console.log('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
            alert('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
            let msg: string = 'BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude;
            this.sendNotification(msg);
            //this.showToast('BackgroundGeolocation:  ' + location.latitude + ',' + location.longitude);
            this.str = "Background";
            // Run update inside of Angular's zone
            this.zone.run(() => {
                this.lat = location.latitude;
                this.lng = location.longitude;
            });
        }, (err) => {
            alert(err);
        });

        // Turn ON the background-geolocation system.
        this.backgroundGeolocation.start();

        // Foreground Tracking
        let options = {
            frequency: 3000,
            enableHighAccuracy: true
        };

        this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {
            console.log(position);
            this.str = "Fore";
            alert("foreground " + position.coords.longitude + "" + position.coords.latitude);
            let msg: string = "foreground " + position.coords.longitude + "" + position.coords.latitude;
            this.sendNotification(msg);
            //this.showToast("foreground " + position.coords.longitude + "" + position.coords.latitude);
            // Run update inside of Angular's zone
            this.zone.run(() => {
                this.lat = position.coords.latitude;
                this.lng = position.coords.longitude;
            });
        });
    }

    stopTracking() {
        console.log('stopTracking');
        this.backgroundGeolocation.finish();
        this.watch.unsubscribe();
    }

    showToast(msg: string) {
        let toast = this.toastCtrl.create({
            message: msg,
            duration: 3000
        });
        toast.present();
    }

    sendNotification(msg: string) {
        this.localNotifications.schedule({
            id: 1,
            text: msg,
            sound: this.setSound(),
            icon: 'file://assets/icon/ic.ico',
            data: { myData: 'this is a hidden message with notification!' }
        });
    }

    setSound() {
        return 'file://assets/sound/closer.mp3'
    }
}