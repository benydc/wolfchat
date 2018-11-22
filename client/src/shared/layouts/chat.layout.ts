import { autoinject, observable } from 'aurelia-framework';
import { SharedState } from '../state/shared-state';
import { ChatRoomService } from '../services/chat-room.service';
import { BindingEngine } from 'aurelia-framework';

@autoinject()
export class ChatLayout {

  private chatBodyRef: HTMLDivElement;
  private newMessage: string;
  private observer: MutationObserver;
  @observable private hasFocus: boolean;

  constructor(private sharedState: SharedState, private chatRoomService: ChatRoomService, private bindingEngine: BindingEngine) { }

  attached() {
    // Create an observer and pass it a callback.
    this.observer = new MutationObserver(() => this.scrollToBottom());

    this.bindingEngine.propertyObserver(this.sharedState.activeChatRoom, 'isActiveChatRoom')
      .subscribe((newValue, oldValue) => {
        if (newValue) {
          // Tell it to look for new children that will change the height.
          var config = { childList: true };
          this.observer.observe(this.chatBodyRef, config);
        } else {
          this.observer.disconnect();
        }
      });
  }

  send() {
    this.chatRoomService.sendMessage(this.newMessage);
    this.newMessage = '';
    this.hasFocus = false;
  }

  hasFocusChanged(newValue) {
    //console.log(newValue);
  }

  openSettings() {

  }

  // First, define a helper function.
  animateScroll(duration) {
    var start = this.chatBodyRef.scrollTop;
    var end = this.chatBodyRef.scrollHeight;
    var change = end - start;
    var increment = 20;

    const easeInOut = (currentTime, start, change, duration) => {
      // by Robert Penner
      currentTime /= duration / 2;
      if (currentTime < 1) {
        return change / 2 * currentTime * currentTime + start;
      }
      currentTime -= 1;
      return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
    }

    const animate = (elapsedTime) => {
      elapsedTime += increment;
      var position = easeInOut(elapsedTime, start, change, duration);
      this.chatBodyRef.scrollTop = position;
      if (elapsedTime < duration) {
        setTimeout(function () {
          animate(elapsedTime);
        }, increment)
      }
    }
    animate(0);
  }

  // Here's our main callback function we passed to the observer
  scrollToBottom() {
    var duration = 300 // Or however many milliseconds you want to scroll to last
    this.animateScroll(duration);
  }

}
