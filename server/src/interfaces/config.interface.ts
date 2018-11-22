export interface IConfig {
    web_app: string,
    web_app_whitelist: string[],
    docker_ip: string,
    cors: boolean,
    server_port: number
}