import { AUTOMATION_REPOSITORY } from '../features/automations/repositories/automation-repository';
import type { Provider } from '@angular/core';
import type { TeamUser } from '../core/models/collaboration';
import { MockCitizenDetailRepository } from './repositories/mock-citizen-detail';
import { MockCitizenSearchRepository } from './repositories/mock-citizen-search';
import { MockInboxRepository } from './repositories/mock-inbox';
import { MockLabelPrintRepository } from './repositories/mock-label-print.repository';
import { MOCK_HOME_MESSAGES } from './data/home-messages.mock';
import { INBOX_REPOSITORY } from '../core/repositories/inbox-repository';
import { TEAM_REPOSITORY } from '../core/repositories/team.repository';
import { CITIZEN_SEARCH_REPOSITORY } from '../core/repositories/citizen-search-repository';
import { CITIZEN_DETAIL_REPOSITORY } from '../features/citizens/repositories/citizen-detail-repository';
import { LABEL_PRINT_REPOSITORY } from '../features/labels/repositories/label-print-repository';
import { HOME_MESSAGE_REPOSITORY } from '../features/home/repositories/home-message.repository';
import { REFERRAL_TREE_REPOSITORY } from '../features/referral-tree/repositories/referral-tree.repository';
import { MockReferralTreeRepository } from './repositories/mock-referral-tree';

const users: readonly TeamUser[] = [
  { id: 'user-ana', name: 'Ana Martins', handle: 'ana.martins', initials: 'AM' },
  { id: 'user-rafael', name: 'Rafael Souza', handle: 'rafael.souza', initials: 'RS' },
  { id: 'user-camila', name: 'Camila Oliveira', handle: 'camila.oliveira', initials: 'CO' },
];

export const MOCK_REPOSITORY_PROVIDERS: Provider[] = [
  { provide: AUTOMATION_REPOSITORY, useExisting: MockCitizenDetailRepository },
  { provide: CITIZEN_DETAIL_REPOSITORY, useExisting: MockCitizenDetailRepository },
  { provide: CITIZEN_SEARCH_REPOSITORY, useExisting: MockCitizenSearchRepository },
  { provide: REFERRAL_TREE_REPOSITORY, useExisting: MockReferralTreeRepository },
  { provide: INBOX_REPOSITORY, useExisting: MockInboxRepository },
  { provide: LABEL_PRINT_REPOSITORY, useExisting: MockLabelPrintRepository },
  { provide: TEAM_REPOSITORY, useValue: { load: () => ({ actor: users[0], users }) } },
  {
    provide: HOME_MESSAGE_REPOSITORY,
    useValue: {
      loadMessage: () => MOCK_HOME_MESSAGES[Date.now() % MOCK_HOME_MESSAGES.length] ?? '',
    },
  },
];
