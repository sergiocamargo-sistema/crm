import type { TeamContext } from './team-context';
import type { CitizenRegistry } from './citizen-registry';
import type { CitizenDetail, CitizenPhoto } from '../features/citizens/models/citizen-detail';
import { isVoteEstimate } from '../core/models/vote-estimate';
import {
  citizenPhoneIdentity,
  emptyCitizenDraft,
  validCitizenBirthDate,
  validCitizenPhone,
  type CitizenAddressDraft,
  type CitizenDuplicateCandidate,
  type CitizenEditingData,
  type CitizenRegistrationCommand,
  type CitizenRegistrationConfiguration,
  type CitizenRegistrationDraft,
  type CitizenRegistrationResult,
  type CitizenUpdateCommand,
} from '../features/citizens/models/citizen-registration';
import { currentCitizenCalendarDate } from '../features/citizens/models/citizen-birth-filters';

const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .trim()
    .replace(/\s+/gu, ' ')
    .toLocaleLowerCase('pt-BR');
const documentValue = (value: string): string => normalize(value).replace(/[^\p{L}\p{N}]/gu, '');

export interface RegistrationMemory {
  readonly completed: readonly (readonly [
    string,
    { signature: string; result: CitizenSaveResult },
  ])[];
  readonly reviews: readonly (readonly [string, string])[];
}

type CitizenSaveResult = Exclude<CitizenRegistrationResult, { kind: 'review' }>;
type CitizenReview = Extract<CitizenRegistrationResult, { kind: 'review' }>;
type CitizenIdentity = Pick<
  CitizenRegistrationDraft,
  'name' | 'phones' | 'emails' | 'documents' | 'addresses'
>;

const addressLine = ({ street, number }: CitizenAddressDraft): string =>
  [street, number].filter(Boolean).join(', ');
const addressIdentity = ({ street, city }: { street: string; city: string }): string =>
  JSON.stringify([normalize(street), normalize(city)]);
const documentIdentity = ({ type, value }: { type: string; value: string }): string =>
  `${type}:${documentValue(value)}`;

function splitAddressLine({ street, number }: { street: string; number?: string }): {
  street: string;
  number: string;
} {
  if (number !== undefined) {
    if (street === number) return { street: '', number };
    const suffix = `, ${number}`;
    return {
      street: number && street.endsWith(suffix) ? street.slice(0, -suffix.length) : street,
      number,
    };
  }
  const match = /^(.*),\s*(\d[\da-z/-]*|s\/n)$/iu.exec(street);
  return match ? { street: match[1], number: match[2] } : { street, number: '' };
}

const isDocumentField = (
  field: string,
  types: CitizenRegistrationConfiguration['documentTypes'],
): boolean =>
  types.some(
    ({ label }) =>
      field === label ||
      (field.startsWith(`${label} `) && /^\d+$/u.test(field.slice(label.length + 1))),
  );

export class CitizenRegistration {
  constructor(
    private readonly registry: CitizenRegistry,
    private readonly team: TeamContext,
    private readonly config: CitizenRegistrationConfiguration,
    memory?: RegistrationMemory,
  ) {
    for (const [id, value] of memory?.completed ?? []) this.completed.set(id, value);
    for (const [id, value] of memory?.reviews ?? []) this.reviews.set(id, value);
  }

  snapshot(): RegistrationMemory {
    return { completed: [...this.completed], reviews: [...this.reviews] };
  }
  private readonly completed = new Map<string, { signature: string; result: CitizenSaveResult }>();
  private readonly reviews = new Map<string, string>();

  async configuration(): Promise<CitizenRegistrationConfiguration> {
    return { genders: this.config.genders, documentTypes: this.config.documentTypes };
  }

  async loadForEdit(id: string): Promise<CitizenEditingData | null> {
    const person = this.findCitizen(id);
    if (!person) return null;
    const referrer = this.registry.citizens().find((member) => member.id === person.referrerId);
    return {
      draft: this.toDraft(person),
      photos: person.photos,
      referrer: referrer
        ? {
            id: referrer.id,
            name: referrer.name,
            initials: referrer.initials,
            neighborhood: referrer.neighborhood,
            phone: referrer.phone,
          }
        : null,
    };
  }

  async create(
    command: CitizenRegistrationCommand,
    categories: readonly string[],
  ): Promise<CitizenRegistrationResult> {
    await Promise.resolve();
    const draft = this.validate(command.draft, categories);
    const signature = JSON.stringify({ draft, photos: command.photos });
    const completed = this.completedSave(command.requestId, signature);
    if (completed) return completed;
    this.validatePhotos(command.photos);
    const candidates = this.duplicateCandidates(draft);
    const review = this.reviewIfRequired(command, signature, candidates);
    if (review) return review;
    const id = crypto.randomUUID();
    this.registry.add({
      ...this.applyProfile(draft, draft),
      id,
      photos: [...command.photos],
      socialLinks: [],
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
              at: new Date().toISOString(),
            },
          }
        : {}),
    });
    return this.completeSave(command.requestId, signature, { kind: 'created', id });
  }

  async update(
    id: string,
    command: CitizenUpdateCommand,
    categories: readonly string[],
  ): Promise<CitizenRegistrationResult> {
    await Promise.resolve();
    const { changes, photos } = command;
    const signature = JSON.stringify({ id, changes, photos });
    const completed = this.completedSave(command.requestId, signature);
    if (completed) return completed;
    const person = this.findCitizen(id);
    if (!person) throw new Error('Munícipe não encontrado.');
    const draft = this.validate(
      { ...emptyCitizenDraft(), ...changes },
      categories,
      changes.name !== undefined,
    );
    if (photos) this.validatePhotos(photos, person.photos);
    if (changes.referrerId !== undefined) this.validateReferrer(id, draft.referrerId);
    const identities = this.changedIdentity(draft, person);
    const candidates = this.duplicateCandidates(identities, id);
    const review = this.reviewIfRequired(command, signature, candidates);
    if (review) return review;
    this.registry.update({
      ...person,
      ...this.applyProfile(draft, changes, person),
      photos: photos ? [...photos] : person.photos,
    });
    return this.completeSave(command.requestId, signature, { kind: 'updated', id });
  }

  private findCitizen(id: string): CitizenDetail | null {
    const person = this.registry.citizens().find((member) => member.id === id);
    return person ? { ...person, ...this.registry.profileEdits()[id] } : null;
  }

  private toDraft(person: CitizenDetail): CitizenRegistrationDraft {
    const field = (label: string): string =>
      person.personalData.find((item) => item.label === label)?.value ?? '';
    const { id } = person;
    const addresses = person.addresses ?? [
      { ...person.address, neighborhood: person.neighborhood },
    ];
    return {
      name: person.name,
      birthDate: person.birthDate ?? '',
      gender: this.config.genders.find(({ label }) => label === field('Sexo'))?.value ?? '',
      occupation: field('Profissão'),
      cra: person.cra ?? '',
      observations: person.observations,
      phones: person.phones.map(({ number, label, whatsappUrl }, index) => ({
        key: `${id}-phone-${index}`,
        number,
        label,
        whatsapp: !!whatsappUrl,
      })),
      emails: person.emails.map((email, index) => ({ ...email, key: `${id}-email-${index}` })),
      addresses: addresses.map((address, index) => {
        const { street, number } = splitAddressLine(address);
        return { ...address, street, number, key: `${id}-address-${index}` };
      }),
      documents: this.documents(person).map((doc, index) => ({
        ...doc,
        key: `${id}-document-${index}`,
      })),
      categories: [...person.categories],
      referrerId: person.referrerId ?? '',
      voteEstimate: person.voteEstimate ?? null,
    };
  }

  private documents(person: CitizenDetail): NonNullable<CitizenDetail['documents']> {
    return (
      person.documents ??
      person.personalData
        .filter(({ label }) => ['CPF', 'RG'].includes(label))
        .map(({ label, value }) => ({ type: label.toLowerCase(), value, issuer: '' }))
    );
  }

  private validateReferrer(id: string, referrerId: string): void {
    const people = new Map(this.registry.citizens().map((person) => [person.id, person]));
    const visited = new Set([id]);
    while (referrerId) {
      if (visited.has(referrerId)) {
        throw new Error('Selecione outro indicador. Esse vínculo formaria um ciclo de indicações.');
      }
      visited.add(referrerId);
      const referrer = people.get(referrerId);
      if (!referrer) throw new Error('O munícipe indicador não foi encontrado.');
      referrerId = referrer.referrerId ?? '';
    }
  }

  private validatePhotos(
    photos: readonly CitizenPhoto[],
    existing: readonly CitizenPhoto[] = [],
  ): void {
    if (
      photos.some(
        ({ src, label }) =>
          !label.trim() ||
          (!src.startsWith('blob:') &&
            !/^crm-file:\/\/[a-f0-9-]{36}$/u.test(src) &&
            !existing.some((photo) => photo.src === src)),
      )
    ) {
      throw new Error('Revise as fotos selecionadas.');
    }
  }

  private changedIdentity(
    draft: CitizenRegistrationDraft,
    current: CitizenDetail,
  ): CitizenIdentity {
    const { phones, emails, documents, addresses } = current;
    const phoneIds = new Set(phones.map(({ number }) => citizenPhoneIdentity(number)));
    const emailIds = new Set(emails.map(({ address }) => normalize(address)));
    const documentIds = new Set((documents ?? this.documents(current)).map(documentIdentity));
    const addressIds = new Set((addresses ?? [current.address]).map(addressIdentity));
    return {
      name: normalize(current.name) === normalize(draft.name) ? '' : draft.name,
      phones: draft.phones.filter(({ number }) => !phoneIds.has(citizenPhoneIdentity(number))),
      emails: draft.emails.filter(({ address }) => !emailIds.has(normalize(address))),
      documents: draft.documents.filter((doc) => !documentIds.has(documentIdentity(doc))),
      addresses: draft.addresses.filter(
        (address) => !addressIds.has(addressIdentity({ ...address, street: addressLine(address) })),
      ),
    };
  }

  private duplicateCandidates(draft: CitizenIdentity, ownId?: string): CitizenDuplicateCandidate[] {
    return this.registry.citizens().flatMap((person) => {
      if (person.id === ownId) return [];
      const reasons: string[] = [];
      if (draft.name && normalize(person.name) === normalize(draft.name))
        reasons.push('Mesmo nome');
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
      const documents = this.documents(person);
      if (
        draft.documents.some((doc) =>
          documents.some((other) => documentIdentity(doc) === documentIdentity(other)),
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
                addressIdentity({ ...address, street: addressLine(address) }) ===
                addressIdentity(other),
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
  }

  private completedSave(requestId: string, signature: string): CitizenSaveResult | undefined {
    if (!requestId) throw new Error('Reabra o cadastro para iniciar uma nova gravação.');
    const completed = this.completed.get(requestId);
    if (completed && completed.signature !== signature) {
      throw new Error('Este cadastro já foi salvo. Abra sua ficha para continuar.');
    }
    return completed?.result;
  }

  private reviewIfRequired(
    command: Pick<CitizenRegistrationCommand, 'requestId' | 'review'>,
    signature: string,
    candidates: readonly CitizenDuplicateCandidate[],
  ): CitizenReview | null {
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
    return null;
  }

  private completeSave(
    requestId: string,
    signature: string,
    result: CitizenSaveResult,
  ): CitizenSaveResult {
    this.completed.set(requestId, { signature, result });
    const token = this.reviews.get(requestId);
    if (token) this.reviews.delete(token);
    this.reviews.delete(requestId);
    return result;
  }

  private applyProfile(
    draft: CitizenRegistrationDraft,
    changes: Partial<CitizenRegistrationDraft>,
    current?: CitizenDetail,
  ) {
    const draftPhones = draft.phones.map((phone) => {
      const international = citizenPhoneIdentity(phone.number);
      return {
        number: phone.number,
        label: phone.label,
        callUrl: `tel:+${international}`,
        ...(phone.whatsapp ? { whatsappUrl: `https://wa.me/${international}` } : {}),
      };
    });
    const draftAddresses = draft.addresses.map(({ key, ...address }) => ({
      ...address,
      street: addressLine({ key, ...address }),
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
    const addressChanged = changes.addresses !== undefined;
    const phoneChanged = changes.phones !== undefined;
    const address = addressChanged
      ? (draftAddresses[0] ?? emptyAddress)
      : (current?.address ?? emptyAddress);
    const gender = this.config.genders.find((item) => item.value === draft.gender)?.label;
    const referrer = this.registry.citizens().find((person) => person.id === draft.referrerId);
    const oldPersonalData = current?.personalData ?? [];
    const knownName = oldPersonalData.some(({ label }) => label === 'Nome completo');
    const birthdayLabel = oldPersonalData.some(({ label }) => label === 'Data de nascimento')
      ? 'Data de nascimento'
      : 'Nascimento';
    const personalData = [
      ...oldPersonalData.filter(
        ({ label }) =>
          !(changes.name !== undefined && label === 'Nome completo') &&
          !(
            changes.birthDate !== undefined && ['Nascimento', 'Data de nascimento'].includes(label)
          ) &&
          !(changes.gender !== undefined && label === 'Sexo') &&
          !(changes.occupation !== undefined && label === 'Profissão') &&
          !(changes.documents !== undefined && isDocumentField(label, this.config.documentTypes)) &&
          !(changes.referrerId !== undefined && label === 'Indicado por'),
      ),
      ...(knownName && changes.name !== undefined
        ? [{ label: 'Nome completo', value: draft.name }]
        : []),
      ...(draft.birthDate
        ? [{ label: birthdayLabel, value: draft.birthDate.split('-').reverse().join('/') }]
        : []),
      ...(gender ? [{ label: 'Sexo', value: gender }] : []),
      ...(draft.occupation ? [{ label: 'Profissão', value: draft.occupation }] : []),
      ...draft.documents.map((doc, index) => ({
        label: `${this.config.documentTypes.find((type) => type.value === doc.type)?.label ?? 'Documento'} ${index + 1}`,
        value: [doc.value, doc.issuer].filter(Boolean).join(' · '),
      })),
      ...(referrer ? [{ label: 'Indicado por', value: referrer.name }] : []),
    ];
    const name = changes.name !== undefined ? draft.name : (current?.name ?? '');
    return {
      name,
      initials:
        changes.name === undefined && current
          ? current.initials
          : name
              .split(/\s+/u)
              .filter(Boolean)
              .map((part) => part[0])
              .filter((_, index, all) => index === 0 || index === all.length - 1)
              .join('')
              .toLocaleUpperCase('pt-BR'),
      phone: phoneChanged ? (draftPhones[0]?.number ?? '') : (current?.phone ?? ''),
      neighborhood: addressChanged
        ? (draftAddresses[0]?.neighborhood ?? '')
        : (current?.neighborhood ?? ''),
      birthDate:
        changes.birthDate !== undefined ? draft.birthDate || null : (current?.birthDate ?? null),
      cra: changes.cra !== undefined ? draft.cra || null : (current?.cra ?? null),
      observations:
        changes.observations !== undefined ? draft.observations : (current?.observations ?? ''),
      phones: phoneChanged ? draftPhones : (current?.phones ?? []),
      emails:
        changes.emails !== undefined
          ? draft.emails.map(({ key, ...email }) => email)
          : (current?.emails ?? []),
      address,
      addresses: addressChanged ? draftAddresses : current?.addresses,
      documents:
        changes.documents !== undefined
          ? draft.documents.map(({ key, ...doc }) => doc)
          : current?.documents,
      referrerId:
        changes.referrerId !== undefined ? draft.referrerId || undefined : current?.referrerId,
      voteEstimate:
        changes.voteEstimate !== undefined ? draft.voteEstimate : (current?.voteEstimate ?? null),
      categories: changes.categories !== undefined ? draft.categories : (current?.categories ?? []),
      personalData,
    };
  }

  private validate(
    input: CitizenRegistrationDraft,
    categories: readonly string[],
    requireName = true,
  ): CitizenRegistrationDraft {
    const trim = (value: string): string => value.trim();
    const draft: CitizenRegistrationDraft = {
      ...input,
      name: input.name.trim().replace(/\s+/gu, ' '),
      cra: trim(input.cra),
      occupation: trim(input.occupation),
      observations: trim(input.observations),
      voteEstimate: input.voteEstimate ?? null,
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
    if (requireName && (!draft.name || draft.name.length > 200))
      throw new Error('Informe o nome com até 200 caracteres.');
    if (!validCitizenBirthDate(draft.birthDate, currentCitizenCalendarDate()))
      throw new Error('Informe uma data de nascimento válida, até hoje.');
    if (draft.gender && !this.config.genders.some(({ value }) => value === draft.gender))
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
          !this.config.documentTypes.some(({ value }) => value === doc.type) ||
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
    if (draft.voteEstimate !== null && !isVoteEstimate(draft.voteEstimate))
      throw new Error('Selecione um nível válido para a estimativa de voto.');
    return draft;
  }
}
