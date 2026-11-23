import { MOCK_REPOSITORY_PROVIDERS } from './mocks/providers';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { HomePageComponent } from './features/home/pages/home-page/home-page.component';
import { CitizenSearchService } from './core/services/citizen-search';

it('mantém o mesmo cabeçalho e a busca ao navegar entre conteúdos', async () => {
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [
      ...MOCK_REPOSITORY_PROVIDERS,
      provideRouter([{ path: 'pagina-de-teste', component: HomePageComponent }, ...routes]),
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(App);
  const router = TestBed.inject(Router);
  await router.navigateByUrl('/');
  await fixture.whenStable();
  const host: HTMLElement = fixture.nativeElement;
  const header = host.querySelector('app-header');
  TestBed.inject(CitizenSearchService).model.set({ query: 'Mariana' });
  await fixture.whenStable();
  await router.navigateByUrl('/pagina-de-teste');
  await fixture.whenStable();
  expect(host.querySelector('app-header')).toBe(header);
  expect(host.querySelectorAll('#global-citizen-search')).toHaveLength(1);
  expect(host.querySelector<HTMLInputElement>('#global-citizen-search')?.value).toBe('Mariana');
  expect(host.querySelectorAll('app-conversation-panel')).toHaveLength(0);
});
