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
  private requestId = crypto.randomUUID();
  private readonly draftPhotoUrls = new Set<string>();
  private loadVersion = 0;
  private alive = true;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this.alive = false;
      this.releaseDraftPhotos();
    });
  }

  async load(id?: string): Promise<void> {
    const version = ++this.loadVersion;
    this.requestId = crypto.randomUUID();
    this.store.loading.set(true);
    this.store.loadError.set('');
    this.store.notFound.set(false);
    this.store.savedId.set(null);
    this.store.configuration.set(null);
    this.store.editingData.set(null);
    this.releaseDraftPhotos();
    this.store.photos.set([]);
    try {
      const [configuration, editingData] = await Promise.all([
        this.repository.loadCitizenRegistration(),
        id ? this.repository.loadCitizenForEdit(id) : null,
      ]);
      if (!this.alive || version !== this.loadVersion) return;
      if (id && !editingData) {
        this.store.notFound.set(true);
        return;
      }
      this.store.editingData.set(editingData);
      this.store.photos.set(editingData?.photos ?? []);
      this.store.configuration.set(configuration);
    } catch {
      if (this.alive && version === this.loadVersion)
        this.store.loadError.set('Não foi possível preparar o cadastro. Tente novamente.');
    } finally {
      if (this.alive && version === this.loadVersion) this.store.loading.set(false);
    }
  }

  clearReview(): void {
    if (this.store.saving()) return;
    this.store.review.set(null);
    this.store.error.set('');
  }

  addPhotos(files: readonly File[]): void {
    if (this.store.saving() || this.store.savedId()) return;
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
      for (const photo of created) this.draftPhotoUrls.add(photo.src);
      this.store.photos.update((photos) => [...photos, ...created]);
      this.clearReview();
    } catch {
      for (const photo of created) URL.revokeObjectURL(photo.src);
      this.store.error.set('Não foi possível abrir as fotos selecionadas.');
    }
  }

  removePhoto(src: string): void {
    if (this.store.saving() || this.store.savedId()) return;
    this.store.photos.update((photos) => photos.filter((photo) => photo.src !== src));
    if (this.draftPhotoUrls.delete(src)) URL.revokeObjectURL(src);
    this.clearReview();
  }

  makePhotoPrimary(src: string): void {
    if (this.store.saving() || this.store.savedId()) return;
    this.store.photos.update((photos) => [
      ...photos.filter((photo) => photo.src === src),
      ...photos.filter((photo) => photo.src !== src),
    ]);
    this.clearReview();
  }

  async save(
    id: string | undefined,
    draft: CitizenRegistrationDraft,
    reason?: string,
  ): Promise<string | null> {
    const original = this.store.editingData();
    if (
      this.store.saving() ||
      this.store.savedId() ||
      !this.store.configuration() ||
      (id && !original)
    )
      return null;
    this.store.saving.set(true);
    this.store.error.set('');
    try {
      const review = this.store.review();
      const command = {
        requestId: this.requestId,
        ...(review && reason !== undefined ? { review: { token: review.token, reason } } : {}),
      };
      const photos = this.store.photos();
      const result =
        id && original
          ? await this.repository.updateCitizen(id, {
              ...command,
              changes: Object.fromEntries(
                (Object.keys(draft) as (keyof CitizenRegistrationDraft)[])
                  .filter(
                    (key) => JSON.stringify(draft[key]) !== JSON.stringify(original.draft[key]),
                  )
                  .map((key) => [key, structuredClone(draft[key])]),
              ),
              ...(this.store.photosChanged() ? { photos } : {}),
            })
          : await this.repository.createCitizen({
              ...command,
              draft: structuredClone(draft),
              photos,
            });
      if (result.kind === 'review') {
        this.store.review.set(result);
        return null;
      }
      this.draftPhotoUrls.clear();
      this.store.savedId.set(result.id);
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

  private releaseDraftPhotos(): void {
    for (const src of this.draftPhotoUrls) URL.revokeObjectURL(src);
    this.draftPhotoUrls.clear();
  }
}
