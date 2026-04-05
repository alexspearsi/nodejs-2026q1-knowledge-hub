import { User } from '../user/user.interface';
import { BaseStorageService } from './base.storage.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserStorageService extends BaseStorageService<User> {}
