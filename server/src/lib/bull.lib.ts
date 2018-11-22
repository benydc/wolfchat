import Queue from 'bull';
import redis from 'redis';
import config from '../config';

let chatRoomCount = new Queue('chat room count', `redis://${config.docker_ip}:9003`, {
    defaultJobOptions: { removeOnComplete: true }
});

let redisClient = redis.createClient({ host: config.docker_ip, port: 9003 });

redisClient.once('ready', () => {
    console.log('Redis connected.');
});

chatRoomCount.process(1, async (job, done) => {

    await redisClient.incr('chat_room_count');

    redisClient.get('chat_room_count', (error, result) => {
        if (error) {
            console.log(error);
            throw error;
        }

        var redisData = JSON.parse(result);
        done(null, redisData);
    })
});

export const chatRoomJob = async (): Promise<any> => {
    let job = await chatRoomCount.add(null);
    return await job.finished();
}