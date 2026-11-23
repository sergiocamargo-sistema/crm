import { MOCK_REPOSITORY_PROVIDERS } from '../../../mocks/providers';
import { TestBed } from '@angular/core/testing';
import { InboxService } from './inbox';

describe('Busca, filas e conexão simulada', () => {
  let inbox: InboxService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: MOCK_REPOSITORY_PROVIDERS });
    inbox = TestBed.inject(InboxService);
  });

  it('busca sem acento e por protocolo, combinando os filtros da fila', () => {
    inbox.query.set('joao');
    expect(inbox.filtered().map((item) => item.id)).toEqual(['joao']);
    inbox.filter.set('mine');
    expect(inbox.filtered()).toHaveLength(0);
    inbox.filter.set('all');
    inbox.query.set('2026-0148');
    expect(inbox.filtered().map((item) => item.id)).toEqual(['mariana']);
  });

  it('assumir atualiza contadores e pausa impede assumir sem mudar a fila', () => {
    inbox.select('joao');
    inbox.availability.set('paused');
    expect(() => inbox.assume()).toThrow();
    expect(inbox.counts().waiting).toBe(3);
    inbox.availability.set('available');
    inbox.assume();
    expect(inbox.counts().waiting).toBe(2);
    expect(inbox.counts().mine).toBe(3);
  });

  it('canal offline bloqueia resposta externa, mas mantém notas internas', () => {
    inbox.connected.set(false);
    const command = { text: 'Acompanhar amanhã', attachments: [] };
    expect(() => inbox.send({ ...command, mode: 'reply' })).toThrow();
    expect(inbox.send({ ...command, mode: 'note' })).toBe(true);
    expect(inbox.selected()?.messages.at(-1)?.kind).toBe('note');
  });
});
