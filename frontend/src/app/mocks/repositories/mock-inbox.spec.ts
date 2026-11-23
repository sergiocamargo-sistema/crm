import { TestBed } from '@angular/core/testing';
import { CURRENT_USER } from '../data/inbox.mock';
import { MockInboxRepository } from './mock-inbox';

const reply = { text: 'Resposta de teste', mode: 'reply' as const, attachments: [] };

describe('Regras da caixa de demonstração', () => {
  let repository: MockInboxRepository;
  beforeEach(() => {
    repository = TestBed.inject(MockInboxRepository);
  });

  it('exige assumir a conversa antes de responder, sem deixar mensagem parcial', () => {
    const before = repository.conversations().find((item) => item.id === 'joao')!;
    expect(() => repository.send('joao', reply)).toThrow();
    expect(repository.conversations().find((item) => item.id === 'joao')?.messages).toEqual(
      before.messages,
    );
    repository.assume('joao');
    expect(repository.send('joao', reply)).toBe(true);
    expect(repository.conversations().find((item) => item.id === 'joao')?.owner?.id).toBe(
      CURRENT_USER.id,
    );
  });

  it('nota interna não substitui o resumo da mensagem nem renova o contato', () => {
    const before = repository.conversations().find((item) => item.id === 'mariana')!;
    repository.send('mariana', { ...reply, mode: 'note' });
    const after = repository.conversations().find((item) => item.id === 'mariana')!;
    expect(after.preview).toBe(before.preview);
    expect(after.citizen.lastContact).toBe(before.citizen.lastContact);
    expect(after.messages.at(-1)?.kind).toBe('note');
    expect(after.activities[0].author).toBe('Ana Martins');
  });

  it('não permite assumir conversa de outro atendente e bloqueia edição após transferir', () => {
    expect(() => repository.assume('carlos')).toThrow();
    repository.transfer('mariana', 'rafael-souza');
    expect(() => repository.send('mariana', reply)).toThrow();
    expect(() => repository.close('mariana')).toThrow();
  });

  it('encerrar conversa preserva o estado do protocolo e pode ser reaberto', () => {
    repository.close('mariana');
    const closed = repository.conversations().find((item) => item.id === 'mariana')!;
    expect(closed.status).toBe('closed');
    expect(closed.request?.status).toBe('Em andamento');
    repository.assume('mariana');
    expect(repository.conversations().find((item) => item.id === 'mariana')?.status).toBe('active');
  });

  it('rejeita mensagem vazia e reinicia sem conservar alterações da demonstração', () => {
    expect(repository.send('mariana', { ...reply, text: '  ' })).toBe(false);
    repository.assume('joao');
    repository.send('joao', reply);
    repository.reset();
    expect(repository.conversations().find((item) => item.id === 'joao')?.status).toBe('waiting');
    expect(repository.conversations().find((item) => item.id === 'joao')?.messages).toHaveLength(2);
  });
});
