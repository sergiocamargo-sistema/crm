import { Component, computed, input } from '@angular/core';

const PATHS = {
  print: 'M6 9V3h12v6 M6 17H3V9h18v8h-3 M6 14h12v7H6z M17 12h.01',
  kanban: 'M3 4h5v16H3z M10 4h5v16h-5z M17 4h4v16h-4z M5 8h1 M5 11h1 M12 8h1 M19 8h.01',
  filePen: 'M14 3H5v18h8 M14 3v6h6 M14 3l6 6 M8 12h5 M8 15h3 M15 18l5-5 2 2-5 5-3 1z',
  scales: 'M12 3v17 M5 21h14 M4 7l8-3 8 3 M4 7l-3 7h6z M20 7l-3 7h6z',
  inbox: 'M4 4h16v16H4z M4 14h5l2 3h2l2-3h5',
  dashboard: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
  users:
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M15 3a4 4 0 0 1 0 8 M22 21v-2a4 4 0 0 0-3-3.87 M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  clipboard: 'M9 5H5v16h14V5h-4 M9 3h6v4H9z M8 12h8 M8 16h5',
  calendar: 'M5 5h14v16H5z M8 3v4 M16 3v4 M5 10h14 M8 14h2 M14 14h2 M8 18h2',
  event: 'M5 5h14v16H5z M8 3v4 M16 3v4 M5 10h14 M9 15l2 2 4-4',
  chart: 'M4 4v16h16 M8 16v-5 M13 16V7 M18 16v-8',
  tag: 'M3 4v7l10 10 8-8L11 3H4z M7 7h.01',
  history: 'M3 11a9 9 0 1 1 2.6 7 M3 4v7h7 M12 7v5l3 2',
  settings:
    'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  search: 'M21 21l-5-5 M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0',
  filter: 'M4 7h16 M7 12h10 M10 17h4',
  filterFunnel: 'M3 4h18l-7 8v7l-4 2v-9z',
  chevron: 'M9 5l7 7-7 7',
  down: 'M6 9l6 6 6-6',
  arrow: 'M5 12h14 M13 6l6 6-6 6',
  back: 'M19 12H5 M11 6l-6 6 6 6',
  plus: 'M12 5v14 M5 12h14',
  close: 'M6 6l12 12 M18 6L6 18',
  check: 'M5 12l4 4L19 6',
  checks: 'M2 12l4 4L16 6 M10 14l2 2L22 6',
  circleCheck: 'M22 11v1a10 10 0 1 1-6-9 M22 4L12 14l-3-3',
  clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M12 6v6l4 2',
  microphone: 'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0z M5 10v2a7 7 0 0 0 14 0v-2 M12 19v3 M8 22h8',
  stop: 'M6 6h12v12H6z',
  message:
    'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5',
  whatsapp:
    'M20.5 11.8a8.5 8.5 0 0 1-12.6 7.5L3 21l1.6-4.8A8.5 8.5 0 1 1 20.5 11.8 M8.6 7.4l1.2 2.4-1 1a9 9 0 0 0 4.4 4.2l1-1.1 2.3 1.2c-.2 2-1.6 2-2.7 1.6-3.8-1.4-6.6-4.2-7-7.4 0-1 .6-1.8 1.8-1.9',
  bell: 'M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9 M10 21h4',
  help: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2-3 4 M12 17h.01',
  more: 'M5 12h.01 M12 12h.01 M19 12h.01',
  location: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0 M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  phone:
    'M22 17v3a2 2 0 0 1-2.2 2 20 20 0 0 1-8.7-3.1 20 20 0 0 1-6-6A20 20 0 0 1 2 4.2 2 2 0 0 1 4 2h3l2 5-2 2a16 16 0 0 0 8 8l2-2z',
  user: 'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2 M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  transfer: 'M4 7h15 M15 3l4 4-4 4 M20 17H5 M9 13l-4 4 4 4',
  send: 'M22 2L9 15 M22 2l-7 20-5-12L2 5z',
  attachment: 'M21 11l-8 8a6 6 0 0 1-8.5-8.5l9-9a4 4 0 0 1 5.7 5.7l-9 9a2 2 0 0 1-2.8-2.8l8-8',
  smile: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M8 14s1 3 4 3 4-3 4-3 M8 9h.01 M16 9h.01',
  sparkles: 'M12 3l2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5z M20 2v4 M18 4h4',
  lock: 'M5 10h14v11H5z M8 10V6a4 4 0 0 1 8 0v4',
  note: 'M5 3h14v14l-4 4H5z M15 21v-5h4 M8 8h8 M8 12h5',
  file: 'M14 2H5v20h14V7z M14 2v6h5 M8 12h8 M8 16h6',
  download: 'M12 3v12 M7 10l5 5 5-5 M4 16v5h16v-5',
  menu: 'M4 6h16 M4 12h16 M4 18h16',
  building: 'M4 21V9h16v12 M8 21v-4h8v4 M3 9l9-6 9 6 M8 12v1 M12 12v1 M16 12v1 M2 21h20',
  refresh: 'M20 7a9 9 0 0 0-15-2L2 8 M2 2v6h6 M4 17a9 9 0 0 0 15 2l3-3 M22 22v-6h-6',
  arrowUp: 'M7 17L17 7 M7 7h10v10',
  arrowDown: 'M7 7l10 10 M7 17h10V7',
  link: 'M10 13a5 5 0 0 0 7 .5l4-4a5 5 0 0 0-7-7l-2 2 M14 11a5 5 0 0 0-7-.5l-4 4a5 5 0 0 0 7 7l2-2',
  image: 'M3 3h18v18H3z M3 17l6-6 4 4 3-3 5 5 M9 7h.01',
  expand: 'M8 3H3v5 M16 3h5v5 M21 16v5h-5 M8 21H3v-5',
  mail: 'M3 5h18v14H3z M3 5l9 8 9-8',
  share:
    'M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M9 10.5l6-4 M9 13.5l6 4',
  instagram:
    'M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4 M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0 M17.5 6.5h.01',
  facebook: 'M14 22V13h3l1-4h-4V7a2 2 0 0 1 2-2h2V2h-3a5 5 0 0 0-5 5v2H7v4h3v9',
  linkedin: 'M4 9v12 M4 4v.01 M9 21V9h4v2c1-3 7-3 7 2v8 M13 11v10',
} as const;

export type IconName = keyof typeof PATHS;

@Component({
  selector: 'app-icon',
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
  host: { 'aria-hidden': 'true' },
})
export class IconComponent {
  readonly name = input.required<IconName>();
  protected readonly path = computed(() => PATHS[this.name()]);
}
