import type { IconName } from '../../shared/components/icon/icon.component';

export interface CitizenSummary {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly neighborhood: string;
  readonly phone: string;
}

export interface CitizenActionsSummary {
  readonly id: string;
  readonly name: string;
  readonly whatsappUrl: string;
  readonly socialLinks: readonly {
    readonly label: string;
    readonly url: string;
    readonly icon: IconName;
  }[];
}

export interface CitizenSearchResult extends CitizenSummary, CitizenActionsSummary {}
