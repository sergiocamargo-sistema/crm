import { InjectionToken } from '@angular/core';
export interface FilesRepository {
  upload(file: File): Promise<string>;
}
export const FILES_REPOSITORY = new InjectionToken<FilesRepository>('FilesRepository');
