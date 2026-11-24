import { inject, Service } from '@angular/core';
import { TeamCollaborationService } from '../../core/services/team-collaboration.service';
import type { CitizenDetail } from '../../features/citizens/models/citizen-detail';
import {
  citizenPhoneIdentity,
  validCitizenBirthDate,
  validCitizenPhone,
  type CitizenRegistrationCommand,
  type CitizenRegistrationConfiguration,
  type CitizenRegistrationDraft,
  type CitizenRegistrationResult,
} from '../../features/citizens/models/citizen-registration';
import { currentCitizenCalendarDate } from '../../features/citizens/models/citizen-birth-filters';
import { CITIZEN_DOCUMENT_TYPES, CITIZEN_GENDERS } from '../data/citizen-registration.mock';
import { MockCitizenRegistry } from './mock-citizen-registry';

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .replace(/\s+/gu, ' ')
    .toLocaleLowerCase('pt-BR');
const documentValue = (value: string): string => normalize(value).replace(/[^\p{L}\p{N}]/gu, '');

@Service()
export class MockCitizenRegistration {
  private readonly registry = inject(MockCitizenRegistry);
  private readonly team = inject(TeamCollaborationService);
  private readonly completed = new Map<string, { signature: string; id: string }>();
  private readonly reviews = new Map<string, string>();

  async configuration(categories: readonly string[]): Promise<CitizenRegistrationConfiguration> {
    return { genders: CITIZEN_GENDERS, documentTypes: CITIZEN_DOCUMENT_TYPES, categories };
  }

  async create(
    command: CitizenRegistrationCommand,
    categories: readonly string[],
  ): Promise<CitizenRegistrationResult> {
    await Promise.resolve();
    const draft = this.validate(command.draft, categories);
    const signature = JSON.stringify({ draft, photos: command.photos });
    if (!command.requestId) throw new Error('Reabra o cadastro para iniciar uma nova gravação.');
    const completed = this.completed.get(command.requestId);
    if (completed) {
      if (completed.signature !== signature)
        throw new Error('Este cadastro já foi salvo. Abra sua ficha para continuar.');
      return { kind: 'created', id: completed.id };
    }
    if (command.photos.some((photo) => !photo.src.startsWith('blob:') || !photo.label.trim()))
      throw new Error('Revise as fotos selecionadas.');

    const candidates = this.registry.citizens().flatMap((person) => {
      const reasons: string[] = [];
      if (normalize(person.name) === normalize(draft.name)) reasons.push('Mesmo nome');
      if (
        draft.phones.some(({ number }) =>
          person.phones.some(
            (phone) => citizenPhoneIdentity(number) === citizenPhoneIdentity(phone.number),
          ),
        )
      )
        reasons.push('Telefone compartilhado');
      if (
        draft.emails.some(({ address }) =>
          person.emails.some((email) => normalize(address) === normalize(email.address)),
        )
      )
        reasons.push('Mesmo e-mail');
      const documents =
        person.documents ??
        person.personalData
          .filter(({ label }) => ['CPF', 'RG'].includes(label))
          .map(({ label, value }) => ({ type: label.toLowerCase(), value }));
      if (
        draft.documents.some((doc) =>
          documents.some(
            (other) =>
              doc.type === other.type && documentValue(doc.value) === documentValue(other.value),
          ),
        )
      )
        reasons.push('Mesmo documento');
      const addresses = person.addresses ?? [
        { ...person.address, neighborhood: person.neighborhood },
      ];
      if (
        draft.addresses.some(
          (address) =>
            address.street &&
            address.number &&
            address.city &&
            addresses.some(
              (other) =>
                normalize(`${address.street}, ${address.number}`) === normalize(other.street) &&
                normalize(address.city) === normalize(other.city),
            ),
        )
      )
        reasons.push('Mesmo endereço');
      return reasons.length
        ? [
            {
              id: person.id,
              name: person.name,
              initials: person.initials,
              neighborhood: person.neighborhood,
              phone: person.phone,
              reasons,
            },
          ]
        : [];
    });
    const reviewSignature = JSON.stringify({ signature, candidates });
    const confirmed = command.review && this.reviews.get(command.review.token) === reviewSignature;
    if (candidates.length && !confirmed) {
      const token = crypto.randomUUID();
      // Uma nova revisão substitui a anterior da mesma intenção, sem guardar rascunhos indefinidamente.
      const previousToken = this.reviews.get(command.requestId);
      if (previousToken) this.reviews.delete(previousToken);
      this.reviews.set(command.requestId, token);
      this.reviews.set(token, reviewSignature);
      return { kind: 'review', token, candidates };
    }
    if (
      candidates.length &&
      (!command.review ||
        command.review.reason.trim().length < 3 ||
        command.review.reason.length > 500)
    )
      throw new Error('Explique por que este é outro munícipe (de 3 a 500 caracteres).');

    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const phones = draft.phones.map((phone) => {
      const international = citizenPhoneIdentity(phone.number);
      return {
        number: phone.number,
        label: phone.label,
        callUrl: `tel:+${international}`,
        ...(phone.whatsapp ? { whatsappUrl: `https://wa.me/${international}` } : {}),
      };
    });
    const addresses = draft.addresses.map(({ key, number, ...address }) => ({
      ...address,
      street: [address.street, number].filter(Boolean).join(', '),
    }));
    const emptyAddress = {
      street: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      postalCode: '',
      reference: '',
    };
    const address = addresses[0] ?? emptyAddress;
    const gender = CITIZEN_GENDERS.find((item) => item.value === draft.gender)?.label;
    const referrer = this.registry.citizens().find((person) => person.id === draft.referrerId);
    const person: CitizenDetail = {
      id,
      name: draft.name,
      initials: draft.name
        .split(/\s+/u)
        .filter(Boolean)
        .map((part) => part[0])
        .filter((_, index, all) => index === 0 || index === all.length - 1)
        .join('')
        .toLocaleUpperCase('pt-BR'),
      phone: phones[0]?.number ?? '',
      neighborhood: address.neighborhood,
      birthDate: draft.birthDate || null,
      cra: draft.cra || null,
      observations: draft.observations,
      phones,
      emails: draft.emails.map(({ key, ...email }) => email),
      address,
      addresses,
      documents: draft.documents.map(({ key, ...doc }) => doc),
      referrerId: draft.referrerId || undefined,
      categories: draft.categories,
      socialLinks: [],
      personalData: [
        ...(draft.birthDate
          ? [{ label: 'Nascimento', value: draft.birthDate.split('-').reverse().join('/') }]
          : []),
        ...(gender ? [{ label: 'Sexo', value: gender }] : []),
        ...(draft.occupation ? [{ label: 'Profissão', value: draft.occupation }] : []),
        ...draft.documents.map((doc, index) => ({
          label: `${CITIZEN_DOCUMENT_TYPES.find((type) => type.value === doc.type)?.label ?? 'Documento'} ${index + 1}`,
          value: [doc.value, doc.issuer].filter(Boolean).join(' · '),
        })),
        ...(referrer ? [{ label: 'Indicado por', value: referrer.name }] : []),
      ],
      photos: [...command.photos],
      interactions: [],
      requests: [],
      appointments: [],
      registeredAt: currentCitizenCalendarDate(),
      responsible: this.team.actor.name,
      ...(candidates.length && command.review
        ? {
            creationReview: {
              reason: command.review.reason.trim(),
              candidateIds: candidates.map(({ id }) => id),
              author: this.team.actor.name,
              at: now,
            },
          }
        : {}),
    };
    this.registry.add(person);
    this.completed.set(command.requestId, { signature, id });
    const token = this.reviews.get(command.requestId);
    if (token) this.reviews.delete(token);
    this.reviews.delete(command.requestId);
    return { kind: 'created', id };
  }

  private validate(
    input: CitizenRegistrationDraft,
    categories: readonly string[],
  ): CitizenRegistrationDraft {
    const trim = (value: string): string => value.trim();
    const draft: CitizenRegistrationDraft = {
      ...input,
      name: input.name.trim().replace(/\s+/gu, ' '),
      cra: trim(input.cra),
      occupation: trim(input.occupation),
      observations: trim(input.observations),
      phones: input.phones
        .filter((phone) => phone.number.trim() || phone.label.trim())
        .map((phone) => ({ ...phone, number: trim(phone.number), label: trim(phone.label) })),
      emails: input.emails
        .filter((email) => email.address.trim() || email.label.trim())
        .map((email) => ({
          ...email,
          address: trim(email.address).toLowerCase(),
          label: trim(email.label),
        })),
      addresses: input.addresses
        .filter((address) =>
          Object.entries(address).some(([key, value]) => key !== 'key' && value.trim()),
        )
        .map((address) => ({
          ...address,
          street: trim(address.street),
          number: trim(address.number),
          complement: trim(address.complement),
          neighborhood: trim(address.neighborhood),
          city: trim(address.city),
          state: trim(address.state).toUpperCase(),
          postalCode: trim(address.postalCode),
          reference: trim(address.reference),
        })),
      documents: input.documents
        .filter((doc) => doc.value.trim() || doc.issuer.trim())
        .map((doc) => ({ ...doc, value: trim(doc.value), issuer: trim(doc.issuer) })),
      categories: [...new Set(input.categories)],
    };
    if (!draft.name || draft.name.length > 200)
      throw new Error('Informe o nome com até 200 caracteres.');
    if (!validCitizenBirthDate(draft.birthDate, currentCitizenCalendarDate()))
      throw new Error('Informe uma data de nascimento válida, até hoje.');
    if (draft.gender && !CITIZEN_GENDERS.some(({ value }) => value === draft.gender))
      throw new Error('Selecione uma opção de sexo válida.');
    if (draft.cra.length > 60 || draft.occupation.length > 120 || draft.observations.length > 20000)
      throw new Error('Revise os limites de CRA, profissão e observações.');
    if (
      [draft.phones, draft.emails, draft.addresses, draft.documents].some(
        (items) => items.length > 20,
      )
    )
      throw new Error('Use até 20 itens em cada grupo do cadastro.');
    if (
      draft.phones.some(
        (phone) => !phone.number || !validCitizenPhone(phone.number) || phone.label.length > 120,
      )
    )
      throw new Error(
        'Revise os telefones: informe de 8 a 15 dígitos e uma descrição de até 120 caracteres.',
      );
    if (
      new Set(draft.phones.map(({ number }) => citizenPhoneIdentity(number))).size !==
      draft.phones.length
    )
      throw new Error('Há um telefone repetido neste cadastro.');
    if (
      draft.emails.some(
        (email) =>
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email.address) ||
          email.address.length > 254 ||
          email.label.length > 120,
      )
    )
      throw new Error('Revise os e-mails informados.');
    if (new Set(draft.emails.map(({ address }) => address)).size !== draft.emails.length)
      throw new Error('Há um e-mail repetido neste cadastro.');
    if (
      draft.addresses.some(
        (address) =>
          (address.state && !/^[A-Z]{2}$/u.test(address.state)) ||
          (address.postalCode && !/^\d{5}-?\d{3}$/u.test(address.postalCode)) ||
          Object.entries(address).some(([key, value]) => key !== 'key' && value.length > 300),
      )
    )
      throw new Error(
        'Revise o endereço: UF com duas letras, CEP com oito dígitos e campos de até 300 caracteres.',
      );
    if (
      draft.documents.some(
        (doc) =>
          !CITIZEN_DOCUMENT_TYPES.some(({ value }) => value === doc.type) ||
          !documentValue(doc.value) ||
          doc.value.length > 100 ||
          doc.issuer.length > 100 ||
          (doc.type === 'cpf' && !/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/u.test(doc.value)),
      )
    )
      throw new Error(
        'Revise os documentos: CPF deve ter 11 dígitos; número e órgão emissor têm limite de 100 caracteres.',
      );
    if (
      new Set(draft.documents.map((doc) => `${doc.type}:${documentValue(doc.value)}`)).size !==
      draft.documents.length
    )
      throw new Error('Há um documento repetido neste cadastro.');
    if (draft.categories.some((category) => !categories.includes(category)))
      throw new Error('Uma das categorias selecionadas não está disponível.');
    if (draft.referrerId && !this.registry.citizens().some(({ id }) => id === draft.referrerId))
      throw new Error('O munícipe indicado não foi encontrado.');
    return draft;
  }
}
