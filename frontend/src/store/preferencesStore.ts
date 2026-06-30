import { create } from 'zustand';

export type Idioma = 'pt' | 'en' | 'es';
export type Tema = 'light' | 'dark';

interface PreferencesState {
  tema: Tema;
  idioma: Idioma;
  alternarTema: () => void;
  setIdioma: (idioma: Idioma) => void;
}

const temaSalvo = (localStorage.getItem('mm_tema') as Tema | null) ?? 'dark';
const idiomaSalvo = (localStorage.getItem('mm_idioma') as Idioma | null) ?? 'pt';

export const usePreferencesStore = create<PreferencesState>((set) => ({
  tema: temaSalvo,
  idioma: idiomaSalvo,
  alternarTema: () =>
    set((estado) => {
      const novoTema: Tema = estado.tema === 'dark' ? 'light' : 'dark';
      localStorage.setItem('mm_tema', novoTema);
      return { tema: novoTema };
    }),
  setIdioma: (idioma) => {
    localStorage.setItem('mm_idioma', idioma);
    set({ idioma });
  },
}));
