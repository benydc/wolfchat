import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { IUser } from '../interfaces/user.interface';

export class User {
    user_name: string;
    user_password: string;
    user_avatar: string;
    user_rooms: string[];

    constructor(user: IUser) {
        Object.assign(this, user);
    }

    comparePassword(candidatePassword: string) {
        return bcrypt.compare(`${candidatePassword}`, this.user_password)
            .catch(() => { return false; });
    }

    async generateHashPassword() {
        const SALT_FACTOR = 5;
        const salt = await bcrypt.genSalt(SALT_FACTOR);
        const hash = await bcrypt.hash(this.user_password, salt);
        this.user_password = hash;
    }
}