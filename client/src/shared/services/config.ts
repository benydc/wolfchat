import environment from 'environment';

export const config = {
  api_url: environment.debug ? 'http://localhost:3000/api/v1' : 'https://wolfchat.synthbit.io/api/v1'
}
