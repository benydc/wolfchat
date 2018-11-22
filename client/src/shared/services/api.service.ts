import { HttpClient, json } from 'aurelia-fetch-client';
import { autoinject } from 'aurelia-framework';
import { status, parseError } from './service-helper';
import { config } from './config';

@autoinject()
export class ApiService {

  private http: HttpClient;

  constructor() { 
    this.http = new HttpClient();
    this.http.configure(config => {
      config
        .withDefaults({ credentials: 'include' });
    });
  }

  setHeaders() {
    const headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    return new Headers(headersConfig);
  }

  get(path, params?) {
    const options = {
      method: 'GET',
      headers: this.setHeaders()
    };
    return this.http.fetch(`${config.api_url}${path}${params || ''}`, options)
      .then(status)
      .catch(parseError)
  }

  put(path, body = {}) {
    const options = {
      method: 'PUT',
      headers: this.setHeaders(),
      body: json(body)
    };
    return this.http.fetch(`${config.api_url}${path}`, options)
      .then(status)
      .catch(parseError)
  }

  post(path, body = {}) {
    const options = {
      method: 'POST',
      headers: this.setHeaders(),
      body: json(body)
    };
    return this.http.fetch(`${config.api_url}${path}`, options)
      .then(status)
      .catch(parseError)
  }

  delete(path) {
    const options = {
      method: 'DELETE',
      headers: this.setHeaders()
    };
    return this.http.fetch(`${config.api_url}${path}`, options)
      .then(status)
      .catch(parseError)
  }
}
