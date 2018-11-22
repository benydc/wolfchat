import * as configJson from './config.json';
import { IConfig } from '../interfaces/config.interface';

//export default (): IConfig => {
const node_env = process.env.NODE_ENV || "development";
export default configJson[node_env] as IConfig;
//}