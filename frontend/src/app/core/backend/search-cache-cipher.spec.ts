import { SearchCacheCipher } from './search-cache-cipher';

it('o cache cifrado exige a chave da sessão e detecta alteração ou troca de usuário', async () => {
  sessionStorage.clear();
  const cipher = new SearchCacheCipher(sessionStorage);
  const data = { name: 'Pessoa privada', phone: '11999990000' };
  const envelope = await cipher.encrypt('user-one', data);
  expect(JSON.stringify(envelope)).not.toContain(data.name);
  expect(await new SearchCacheCipher(sessionStorage).decrypt('user-one', envelope)).toEqual(data);
  await expect(cipher.decrypt('user-two', envelope)).rejects.toThrow();
  await expect(
    cipher.decrypt('user-one', { ...envelope, ciphertext: envelope.ciphertext.slice(4) }),
  ).rejects.toThrow();
  cipher.clear('user-one');
  await expect(
    new SearchCacheCipher(sessionStorage).decrypt('user-one', envelope),
  ).rejects.toThrow();
});
