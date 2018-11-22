import { autoinject } from "aurelia-framework";
import { UserService } from '../services/user.service';
import { DialogController } from 'aurelia-dialog';

@autoinject()
export class LoginLayout {
  private username = '';
  private password = '';

  constructor(private userService: UserService, private dialogController: DialogController) { }

  async login() {
    if (!this.username || !this.password) return;

    const result = await this.userService.attemptAuth({ user_name: this.username, user_password: this.password });
    if (result.code == 200) {
      this.userService.setAuth(result.data);
      this.username = this.password = '';
      this.dialogController.close(true);
    } else {
      alert('Wrong username or password.');
    }
  }
}
