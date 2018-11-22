import { autoinject } from "aurelia-framework";
import { ApiService } from './api.service';
import { SharedState } from '../state/shared-state';

@autoinject()
export class UserService {

  constructor(private apiService: ApiService, private sharedState: SharedState) { }

  setAuth(data) {
    this.sharedState.username = data.user_name;
    this.sharedState.isAuthenticated = true;
  }

  attemptAuth(credentials: Object) {
    return this.apiService.post('/user/session', credentials);
  }
}
