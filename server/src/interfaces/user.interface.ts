export interface IUser {
    user_name?: string;
    user_password?: string;
    user_avatar?: string;
    user_rooms?: string[];
    comparePassword?(candidatePassword: string): Promise<boolean>;
    generateHashPassword?();
}