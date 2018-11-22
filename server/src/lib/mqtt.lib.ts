import { connect, MqttClient } from 'mqtt';
import config from '../config';

let client: MqttClient;

export const connectToVerneMQ = () => {
    client = connect(`mqtt://${config.docker_ip}:9001`, { resubscribe: true });
    client.on('connect', () => {
        console.log('VerneMQ connected.');
    });
    client.on('error', (error) => {
        console.log(error);
    });
}

export const publish = async (topic: string, message: string | Object) => {
    if (typeof message === 'object')
        message = JSON.stringify(message);

    client.publish(topic, message as string);
}

export const verne: MqttClient = client;