import { Injectable } from '@nestjs/common';
import { Comment } from '../comment/comment.interface';
import { BaseStorageService } from './base.storage.service';

@Injectable()
export class CommentStorageService extends BaseStorageService<Comment> {}
