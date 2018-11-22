import { autoinject } from 'aurelia-framework';
import { SharedState } from '../state/shared-state';
import { ApiService } from './api.service';

@autoinject()
export class ChatRoomService {

  constructor(private sharedState: SharedState, private apiService: ApiService) { }

  async getMessages() {
    let chatRoom = this.sharedState.chatRooms[this.sharedState.activeChatRoom.marker.roomId] || undefined;
    if (!chatRoom)
      this.sharedState.chatRooms[this.sharedState.activeChatRoom.marker.roomId] = await this.apiService.get(`/messages/`, this.sharedState.activeChatRoom.marker.roomId).then(result => result.data.sort((a, b) => {
        a = new Date(a.date_message);
        b = new Date(b.date_message);
        return a > b ? 1 : a < b ? -1 : 0;
      }));
    else
      chatRoom;
  }

  addMessage(roomId, messageObj) {
    if (this.sharedState.chatRooms[roomId]) {
      this.sharedState.chatRooms[roomId].push(messageObj);
    } else {
      this.sharedState.chatRooms[roomId] = [messageObj];
    }
  }

  async sendMessage(message) {
    let newDate = new Date();
    try {
      const result = await this.apiService.post(`/message/${this.sharedState.activeChatRoom.marker.roomId}`, { message: message, date: newDate.getTime() });
      this.addMessage(this.sharedState.activeChatRoom.marker.roomId, {
        message: message,
        user_name: this.sharedState.username,
        date_message: newDate.getTime()
      });
    } catch {
      console.log('error on sending message.');
    }
  }
}
