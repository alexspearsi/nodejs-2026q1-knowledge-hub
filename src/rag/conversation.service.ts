import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface ConversationMessage {
  roles: 'user' | 'assistant';
  content: string;
}

@Injectable()
export class ConversationService {
  private readonly conversations = new Map<string, ConversationMessage[]>();
  private readonly maxMessages: number;

  constructor(private readonly configService: ConfigService) {
    this.maxMessages = this.configService.get<number>(
      'RAG_CONVERSATION_MAX_MESSAGES',
      20,
    );
  }

  getOrCreate(conversationId?: string): string {
    const id = conversationId ?? uuidv4();

    if (!this.conversations.has(id)) {
      this.conversations.set(id, []);
    }

    return id;
  }

  getHistory(conversationId: string): ConversationMessage[] {
    return this.conversations.get(conversationId) ?? [];
  }

  addMessage(conversationId: string, message: ConversationMessage) {
    const history = this.conversations.get(conversationId) ?? [];

    history.push(message);

    if (history.length > this.maxMessages) {
      history.splice(0, history.length - this.maxMessages);
    }

    this.conversations.set(conversationId, history);
  }
}
