import { Component, input } from '@angular/core';

export type IconName =
  | 'grid'
  | 'bars'
  | 'truck'
  | 'box'
  | 'swap'
  | 'search'
  | 'bell'
  | 'plus'
  | 'check'
  | 'arrow-up'
  | 'arrow-down'
  | 'filter'
  | 'close'
  | 'pin'
  | 'sun'
  | 'moon'
  | 'edit'
  | 'trash';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('grid') {
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        }
        @case ('bars') {
          <rect x="4" y="11" width="4" height="9" rx="1" />
          <rect x="10" y="6" width="4" height="14" rx="1" />
          <rect x="16" y="3" width="4" height="17" rx="1" />
        }
        @case ('truck') {
          <rect x="2" y="7" width="12" height="9" rx="1.2" />
          <path d="M14 10h4l4 3.5V16h-8z" />
          <circle cx="6.5" cy="18" r="1.7" />
          <circle cx="16.5" cy="18" r="1.7" />
        }
        @case ('box') {
          <path d="M12 3 3 7.5 12 12l9-4.5z" />
          <path d="M3 7.5v9L12 21l9-4.5v-9" />
          <path d="M12 12v9" />
        }
        @case ('swap') {
          <path d="M4 8h13" />
          <path d="M13 4l4 4-4 4" />
          <path d="M20 16H7" />
          <path d="M11 20l-4-4 4-4" />
        }
        @case ('search') {
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.35-4.35" />
        }
        @case ('bell') {
          <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" />
          <path d="M10 20a2 2 0 0 0 4 0" />
        }
        @case ('plus') {
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        }
        @case ('check') {
          <path d="M20 6 9 17l-5-5" />
        }
        @case ('arrow-up') {
          <path d="M12 19V5" />
          <path d="M6 11l6-6 6 6" />
        }
        @case ('arrow-down') {
          <path d="M12 5v14" />
          <path d="M6 13l6 6 6-6" />
        }
        @case ('filter') {
          <path d="M4 5h16" />
          <path d="M7 12h10" />
          <path d="M10 19h4" />
        }
        @case ('close') {
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        }
        @case ('pin') {
          <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11z" />
          <circle cx="12" cy="10" r="2.5" />
        }
        @case ('sun') {
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="M4.9 4.9l1.4 1.4" />
          <path d="M17.7 17.7l1.4 1.4" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M4.9 19.1l1.4-1.4" />
          <path d="M17.7 6.3l1.4-1.4" />
        }
        @case ('moon') {
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" />
        }
        @case ('edit') {
          <path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3z" />
          <path d="M14.5 6.5l3 3" />
        }
        @case ('trash') {
          <path d="M4 7h16" />
          <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          <path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
          <path d="M10 11v6" />
          <path d="M14 11v6" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  name = input.required<IconName>();
}
