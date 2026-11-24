import { DestroyRef, inject, Service, signal } from '@angular/core';
import type { CitizenDetail } from '../../features/citizens/models/citizen-detail';
import { MOCK_CITIZEN_DETAILS } from '../data/citizen-details.mock';

// Fonte compartilhada entre os repositórios mock de ficha e busca.
@Service()
export class MockCitizenRegistry {
  readonly citizens = signal<readonly CitizenDetail[]>(MOCK_CITIZEN_DETAILS);
  readonly profileEdits = signal<
    Readonly<
      Record<string, Partial<Pick<CitizenDetail, 'observations' | 'categories' | 'voteEstimate'>>>
    >
  >({});
  private readonly photoUrls = new Set<string>();

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      for (const url of this.photoUrls) URL.revokeObjectURL(url);
    });
  }

  add(citizen: CitizenDetail): void {
    for (const photo of citizen.photos) {
      if (photo.src.startsWith('blob:')) this.photoUrls.add(photo.src);
    }
    this.citizens.update((people) => [...people, citizen]);
  }
}
