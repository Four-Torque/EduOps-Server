import { Injectable } from '@nestjs/common';
import { Message } from '@prisma/client';
import { Subject } from 'rxjs';

@Injectable()
export class MessageSseService {
  private readonly messageSubject = new Subject<any>();

  emitMessage(message: Message) {
    this.messageSubject.next(message);
  }

  getEventStream() {
    return this.messageSubject.asObservable();
  }
}
