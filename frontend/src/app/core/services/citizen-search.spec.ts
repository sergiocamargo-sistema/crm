import { MOCK_REPOSITORY_PROVIDERS } from '../../mocks/providers';
import { TestBed } from '@angular/core/testing';
import { CitizenSearchService } from './citizen-search';

describe('Busca compartilhada de munícipes', () => {
  let search: CitizenSearchService;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: MOCK_REPOSITORY_PROVIDERS });
    search = TestBed.inject(CitizenSearchService);
  });

  it('normaliza acentos, letras e espaços na pesquisa por nome', () => {
    search.model.set({ query: '  JOAO  PEREIRA ' });
    expect(search.results().map((person) => person.name)).toEqual(['João Pereira']);
  });

  it('busca por telefone sem depender da máscara', () => {
    search.model.set({ query: '11900000004' });
    expect(search.results().map((person) => person.name)).toEqual(['Carlos Eduardo']);
  });

  it('não exibe a lista toda ao abrir ou limpar o campo e informa ausência de resultados', () => {
    expect(search.results()).toEqual([]);
    search.model.set({ query: 'Pessoa inexistente' });
    expect(search.results()).toEqual([]);
    search.model.set({ query: 'Mariana' });
    expect(search.results()).toHaveLength(1);
    search.clear();
    expect(search.results()).toEqual([]);
    expect(search.hasQuery()).toBe(false);
  });
});
