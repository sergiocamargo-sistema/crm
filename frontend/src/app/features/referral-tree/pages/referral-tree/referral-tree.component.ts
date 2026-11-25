import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CabinetRatingComponent } from '../../../../shared/components/cabinet-rating/cabinet-rating.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { ReferralTreeService } from '../../services/referral-tree.service';

@Component({
  imports: [RouterLink, IconComponent, CabinetRatingComponent],
  selector: 'app-referral-tree',
  styleUrl: './referral-tree.component.scss',
  templateUrl: './referral-tree.component.html',
})
export class ReferralTreeComponent {
  readonly id = input<string>();
  protected readonly state = inject(ReferralTreeService).observeBranch(this.id);
  private readonly injector = inject(Injector);
  private readonly heading = viewChild.required<ElementRef<HTMLHeadingElement>>('heading');

  private readonly ancestry = computed(() => this.state.branch()?.ancestry ?? []);
  protected readonly current = computed(() => this.ancestry().at(-1));
  protected readonly ancestors = computed(() => this.ancestry().slice(0, -1));
  private readonly parent = computed(() => this.ancestors().at(-1));
  protected readonly backLink = computed(() => {
    const parent = this.parent();
    if (parent) return ['/arvore', parent.id];
    return [this.id() ? '/arvore' : '/'];
  });
  protected readonly backLabel = computed(() => {
    const parent = this.parent();
    if (parent) return 'Voltar para ' + parent.name;
    return this.id() ? 'Voltar aos pais' : 'Voltar ao início';
  });

  constructor() {
    let focusedId: string | undefined | null = null;
    effect((onCleanup) => {
      const id = this.id();
      if (this.state.loading() || focusedId === id) return;
      const render = afterNextRender(
        () => {
          this.heading().nativeElement.focus({ preventScroll: true });
          focusedId = id;
        },
        { injector: this.injector },
      );
      onCleanup(() => render.destroy());
    });
  }

  protected retry(): void {
    this.heading().nativeElement.focus({ preventScroll: true });
    this.state.retry();
  }
}
