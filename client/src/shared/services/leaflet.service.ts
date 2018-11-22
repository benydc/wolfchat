import { autoinject } from 'aurelia-framework';
import { SharedState } from '../state/shared-state';
import { ChatRoomService } from './chat-room.service';
import { ApiService } from './api.service';

declare var L;

@autoinject()
export class LeafletService {

  private map;
  private counter = 1;

  constructor(
    private sharedState: SharedState,
    private chatRoomService: ChatRoomService,
    private apiService: ApiService,
  ) { }

  initLeafletMap(mapRef: HTMLDivElement) {
    // Initialize the map and assign it to a variable for later use
    this.map = L.map(mapRef, {
      // Set latitude and longitude of the map center (required)
      center: [46.7712, 23.6236],
      // Set the initial zoom level, values 0-18, where 0 is most zoomed-out (required)
      zoom: 5
    });
    
    this.map.on('click', e => this.onMapClick(e));
    this.getAllRooms();

    // Create a Tile Layer and add it to the map
    //const tiles = new L.tileLayer("http://{s}.tile.stamen.com/watercolor/{z}/{x}/{y}.png").addTo(this.map);
    const tiles = new L.tileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.png").addTo(this.map);
    tiles.once("load", () => { this.map.invalidateSize(); });
  }

  private async onMapClick(e) {

    this.sharedState.activeChatRoom.marker = null;
    this.sharedState.activeChatRoom.isActiveChatRoom = false;

    const newRoomMarker = new L.marker(e.latlng).addTo(this.map);
    newRoomMarker.roomName = "";
    newRoomMarker.roomOwner = this.sharedState.username;
    newRoomMarker.roomLocation = [e.latlng.lat, e.latlng.lng];
    try {
      const result = await this.apiService.post('/create/room', { roomLocation: newRoomMarker.roomLocation, roomName: newRoomMarker.roomName });
      newRoomMarker.roomId = result.data.room_id;
      newRoomMarker.roomName = result.data.room_name;
      this.sharedState.markers.push(newRoomMarker);

      newRoomMarker.on('click', e => this.onMarkerRoomClick(newRoomMarker));
    } catch (err) {
      console.log(err);
    }
  }

  addMarker(marker) {
    const newRoomMarker = new L.marker(marker.geo_location).addTo(this.map);
    newRoomMarker.roomName = marker.room_name;
    newRoomMarker.roomOwner = marker.room_owner;
    newRoomMarker.roomLocation = marker.geo_location;
    newRoomMarker.roomId = marker.room_id;

    this.sharedState.markers.push(newRoomMarker);

    newRoomMarker.on('click', e => this.onMarkerRoomClick(newRoomMarker));
  }

  private onMarkerRoomClick(marker) {
    this.sharedState.activeChatRoom.marker = marker;
    this.sharedState.activeChatRoom.isActiveChatRoom = true;
    this.chatRoomService.getMessages();
  }

  private async getAllRooms() {
    let result = await this.apiService.get('/rooms');
    if (result.code == 200) {
      for (let room of result.data) {
        this.addMarker(room);
      }
    }
  }

}
