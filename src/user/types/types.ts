import { User } from '../user.interface';

export type SafeUser = Omit<User, 'password'>;
