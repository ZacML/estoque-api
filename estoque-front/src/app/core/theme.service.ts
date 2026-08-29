import { Injectable, effect, signal } from '@angular/core';

export type Tema = 'light' | 'dark';

const STORAGE_KEY = 'estoque.tema';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly tema = signal<Tema>(this.temaInicial());

  constructor() {
    effect(() => {
      const tema = this.tema();
      document.documentElement.setAttribute('data-theme', tema);
      document.documentElement.style.colorScheme = tema;
      localStorage.setItem(STORAGE_KEY, tema);
    });
  }

  alternar() {
    this.tema.update((t) => (t === 'dark' ? 'light' : 'dark'));
  }

  private temaInicial(): Tema {
    const salvo = localStorage.getItem(STORAGE_KEY);
    if (salvo === 'dark' || salvo === 'light') return salvo;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
