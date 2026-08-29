import { Component, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="panel" (click)="$event.stopPropagation()">
        <div class="panel-header">
          <h3>{{ title() }}</h3>
          <button class="btn btn-icon" type="button" (click)="close.emit()" aria-label="Fechar">
            <app-icon name="close" />
          </button>
        </div>
        <div class="panel-body">
          <ng-content />
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .overlay {
        position: fixed;
        inset: 0;
        background: var(--overlay);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        z-index: 50;
      }
      .panel {
        background: var(--surface);
        border-radius: var(--radius);
        width: min(28rem, 100%);
        max-height: 90vh;
        overflow-y: auto;
        border: 1px solid var(--border);
      }
      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1.1rem 1.25rem;
        border-bottom: 1px solid var(--border);
      }
      .panel-header h3 {
        font-size: 1.05rem;
        font-weight: 700;
      }
      .panel-body {
        padding: 1.25rem;
      }
    `,
  ],
})
export class ModalComponent {
  title = input('');
  close = output<void>();
}
