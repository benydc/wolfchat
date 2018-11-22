export class SharedState {
  activeChatRoom = { isActiveChatRoom: false, marker: null };
  chatRooms = {};
  isAuthenticated = false;
  username = '';
  markers = [];

  constructor() {
    this.activeChatRoom = { isActiveChatRoom: false, marker: null };
    this.chatRooms = {};
    this.isAuthenticated = false;
    this.username = '';
    this.markers = [];
  }
}
