import { autoinject } from 'aurelia-framework';
import { SharedState } from '../state/shared-state';
import { LeafletService } from './leaflet.service';
import environment from 'environment';

@autoinject()
export class MqttService {
  public client: Paho.MQTT.Client;

  constructor(
    private sharedState: SharedState,
    private leafletService: LeafletService
  ) { }

  connectToVerne() {

    let localhost = environment.debug ? "localhost" : "wolf-vernemq.synthbit.io";

    this.client = new Paho.MQTT.Client(localhost, 8023, '/mqtt', 'web_' + Math.random().toString(16).substr(2, 8));

    // set callback handlers
    this.client.onConnectionLost = responseObject => { this.onConnectionLost(responseObject) };
    this.client.onMessageArrived = message => { this.onMessageArrived(message) };
    var options: Paho.MQTT.ConnectionOptions = {
      onSuccess: () => {
        console.log('Connected to VerneMQ via WebSocket.');
        this.subscribeToAllTopics();
      },
      onFailure: (err) => {
        console.warn(err);
      },
      useSSL: true
    }

    this.client.connect(options);
  }

  onMessageArrived(message: Paho.MQTT.Message) {
    let payload = JSON.parse(message.payloadString);
    let topicPath = message.destinationName.split('/');

    switch (topicPath[0]) {
      case 'message':
        var roomId = topicPath[1];
        if (this.sharedState.chatRooms[roomId] && this.sharedState.username !== payload.user_name)
          this.sharedState.chatRooms[roomId].push(payload);
        break;
      case 'room':
        let isRoomFound = this.sharedState.markers.find(marker => marker.roomId == topicPath[1]);
        if (!isRoomFound)
          this.leafletService.addMarker(payload);
        break;
    }
  }

  onConnectionLost(responseObject: Paho.MQTT.MQTTError) {

  }

  private subscribeToAllTopics() {
    this.client.subscribe('message/+');
    this.client.subscribe('room/+');
  }
}
