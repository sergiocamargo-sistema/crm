import { inject, Service } from '@angular/core';
import { HOME_MESSAGE_REPOSITORY } from '../repositories/home-message.repository';
import { HomeMessageStore } from '../stores/home-message.store';

@Service()
export class HomeMessageService {
  private readonly repository = inject(HOME_MESSAGE_REPOSITORY);
  private readonly store = inject(HomeMessageStore);

  load(): void {
    if (this.store.message() === null) {
      this.store.setMessage(this.repository.loadMessage());
    }
  }
}
