import { inject, Service } from '@angular/core';
import { HOME_MESSAGE_REPOSITORY } from '../repositories/home-message.repository';
import { DataConnection } from '../../../core/backend/data-connection';
import { HomeMessageStore } from '../stores/home-message.store';

@Service()
export class HomeMessageService {
  private readonly connection = inject(DataConnection);
  private readonly repository = inject(HOME_MESSAGE_REPOSITORY);
  private readonly store = inject(HomeMessageStore);

  async load(): Promise<void> {
    if (this.store.message() === null) {
      try {
        this.store.setMessage(await this.repository.loadMessage());
      } catch (error) {
        this.connection.error.set(
          error instanceof Error ? error.message : 'Não foi possível carregar a mensagem.',
        );
      }
    }
  }
}
