import { DestroyRef, inject, Service } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../repositories/citizen-detail-repository';
import type { CitizenRegistrationDraft } from '../models/citizen-registration';
import { CitizenRegistrationStore } from '../stores/citizen-registration.store';
import {
  ATTACHMENT_TYPES,
  attachmentType,
  MAX_ATTACHMENT_SIZE,
} from '../../requests/models/attachment-files';

@Service()
export class CitizenRegistrationService {
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  readonly store = new CitizenRegistrationStore();
  readonly photoAccept = Object.entries(ATTACHMENT_TYPES)
    .filter(([, type]) => type.kind === 'photo')
    .map(([extension]) => `.${extension}`)
    .join(',');
  private readonly requestId = crypto.randomUUID();
  private alive = true;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.alive = false;
      if (!this.store.createdId()) {
        for (const photo of this.store.photos()) URL.revokeObjectURL(photo.src);
      }
    });
    void this.load();
  }

  async load(): Promise<void> {
    if (this.store.loading()) return;
    this.store.loading.set(true);
    this.store.loadError.set('');
    try {
      const configuration = await this.repository.loadCitizenRegistration();
      if (this.alive) this.store.configuration.set(configuration);
    } catch {
      if (this.alive)
        this.store.loadError.set('Não foi possível preparar o cadastro. Tente novamente.');
    } finally {
      if (this.alive) this.store.loading.set(false);
    }
  }

  clearReview(): void {
    if (this.store.saving()) return;
    this.store.review.set(null);
    this.store.error.set('');
  }

  addPhotos(files: readonly File[]): void {
    if (this.store.saving() || this.store.createdId()) return;
    this.store.error.set('');
    if (
      files.some(
        (file) =>
          attachmentType(file.name, file.type)?.kind !== 'photo' ||
          !file.size ||
          file.size > MAX_ATTACHMENT_SIZE,
      )
    ) {
      this.store.error.set(
        'Selecione somente fotos nos formatos aceitos, com até 20 MB por arquivo.',
      );
      return;
    }
    const created: { src: string; label: string }[] = [];
    try {
      for (const file of files) created.push({ src: URL.createObjectURL(file), label: file.name });
      this.store.photos.update((photos) => [...photos, ...created]);
      this.clearReview();
    } catch {
      for (const photo of created) URL.revokeObjectURL(photo.src);
      this.store.error.set('Não foi possível abrir as fotos selecionadas.');
    }
  }

  removePhoto(src: string): void {
    if (this.store.saving() || this.store.createdId()) return;
    this.store.photos.update((photos) => photos.filter((photo) => photo.src !== src));
    URL.revokeObjectURL(src);
    this.clearReview();
  }

  makePhotoPrimary(src: string): void {
    if (this.store.saving() || this.store.createdId()) return;
    this.store.photos.update((photos) => [
      ...photos.filter((photo) => photo.src === src),
      ...photos.filter((photo) => photo.src !== src),
    ]);
    this.clearReview();
  }

  async save(draft: CitizenRegistrationDraft, reason?: string): Promise<string | null> {
    if (this.store.saving() || !this.store.configuration()) return null;
    this.store.saving.set(true);
    this.store.error.set('');
    try {
      const review = this.store.review();
      const result = await this.repository.createCitizen({
        requestId: this.requestId,
        draft: structuredClone(draft),
        photos: [...this.store.photos()],
        ...(review && reason !== undefined ? { review: { token: review.token, reason } } : {}),
      });
      if (result.kind === 'review') {
        this.store.review.set(result);
        return null;
      }
      this.store.createdId.set(result.id);
      this.store.review.set(null);
      return result.id;
    } catch (error: unknown) {
      this.store.error.set(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o munícipe. Tente novamente.',
      );
      return null;
    } finally {
      this.store.saving.set(false);
    }
  }
}
