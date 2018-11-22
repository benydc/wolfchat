import { autoinject } from 'aurelia-framework';
import { SharedState } from './shared/state/shared-state';
import { DialogService } from 'aurelia-dialog';
import { LoginLayout } from './shared/layouts/login.layout';
import { MqttService } from './shared/services/mqtt.service';
import { LeafletService } from './shared/services/leaflet.service';

@autoinject()
export class App {

  private mapRef;

  constructor(
    private sharedState: SharedState,
    private dialogService: DialogService,
    private mqttService: MqttService,
    private leafletService: LeafletService
  ) { }

  activate() {
    this.mqttService.connectToVerne();
  }

  attached() {
    if (!this.sharedState.isAuthenticated) {
      this.dialogService.open({ viewModel: LoginLayout, lock: true, overlayDismiss: false });
    }

    this.leafletService.initLeafletMap(this.mapRef);
  }
}
