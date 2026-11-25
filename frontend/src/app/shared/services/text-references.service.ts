import { computed, DOCUMENT, inject, Service } from '@angular/core';
import { CITIZEN_DETAIL_REPOSITORY } from '../../features/citizens/repositories/citizen-detail-repository';
import { TeamCollaborationService } from '../../core/services/team-collaboration.service';
import { RemoteReadStore } from '../../core/stores/read-store';
import type { RichTextPart } from '../../core/models/collaboration';

@Service()
export class TextReferencesService {
  private readonly repository = inject(CITIZEN_DETAIL_REPOSITORY);
  private readonly document = inject(DOCUMENT);
  private readonly team = inject(TeamCollaborationService);
  private readonly records = new RemoteReadStore(() => this.repository.listTextReferences(), [])
    .state;

  parts(text: string): readonly RichTextPart[] {
    const pattern =
      /https?:\/\/[^\s<>"']+|\/(?:municipes|solicitacoes|interacoes|conversas|agendamentos)\/[^\s<>"']+|\/kanban\?[^\s<>"']+|(?<![\p{L}\p{N}._@/])@([a-z0-9](?:[a-z0-9._-]*[a-z0-9])?)/giu;
    const parts: RichTextPart[] = [];
    let offset = 0;
    for (const match of text.matchAll(pattern)) {
      const index = match.index;
      if (index > offset) parts.push({ kind: 'text', text: text.slice(offset, index) });
      const token = match[0];
      if (token.startsWith('@')) {
        const user = this.team.users.find((item) => item.handle === match[1]?.toLowerCase());
        parts.push(
          user
            ? { kind: 'mention', text: `@${user.name}`, userId: user.id }
            : { kind: 'text', text: token },
        );
      } else {
        const link = token.replace(/[),.;!?]+$/u, '');
        parts.push(this.linkPart(link));
        if (link.length < token.length)
          parts.push({ kind: 'text', text: token.slice(link.length) });
      }
      offset = index + token.length;
    }
    if (offset < text.length) parts.push({ kind: 'text', text: text.slice(offset) });
    return parts;
  }
  private linkPart(text: string): RichTextPart {
    try {
      const origin = this.document.location.origin;
      const url = new URL(text, origin);
      if (!['http:', 'https:'].includes(url.protocol)) return { kind: 'text', text };
      if (url.origin !== origin) return { kind: 'link', text, href: url.href, internal: false };
      const basePath = new URL(this.document.baseURI).pathname;
      const pathname = url.pathname.startsWith(basePath)
        ? `/${url.pathname.slice(basePath.length)}`
        : url.pathname;
      const record = this.records().find((item) => {
        const target = new URL(item.href, origin);
        return (
          pathname === target.pathname &&
          (target.pathname !== '/kanban' ||
            url.searchParams.get('tarefa') === target.searchParams.get('tarefa'))
        );
      });
      return {
        kind: 'link',
        text: record?.title ?? text,
        href: `${pathname}${url.search}${url.hash}`,
        internal: true,
      };
    } catch {
      return { kind: 'text', text };
    }
  }
}
