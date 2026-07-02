import { describe, it, expect } from 'vitest';
import { matchReadableSource } from './publicDomain';

const sources = [
  { normTitle: 'dracula', authorSurnames: ['stoker'], epubUrl: 'https://gutenberg.org/dracula.epub' },
  { normTitle: 'pride and prejudice', authorSurnames: ['austen'], epubUrl: 'https://gutenberg.org/pride.epub' },
  { normTitle: 'don quijote', authorSurnames: ['cervantes saavedra'], epubUrl: 'https://gutenberg.org/quijote.epub' },
];

describe('matchReadableSource', () => {
  it('matchea por título exacto y autor', () => {
    expect(matchReadableSource(sources, 'Dracula', 'Bram Stoker')).toBe(
      'https://gutenberg.org/dracula.epub'
    );
  });

  it('normaliza acentos y puntuación del título', () => {
    expect(matchReadableSource(sources, 'Drácula!', 'Bram Stoker')).toBe(
      'https://gutenberg.org/dracula.epub'
    );
  });

  it('rechaza cuando el autor no coincide (título homónimo de otro autor)', () => {
    expect(matchReadableSource(sources, 'Dracula', 'Otra Persona')).toBeNull();
  });

  it('matchea apellidos compuestos parcialmente', () => {
    expect(matchReadableSource(sources, 'Don Quijote', 'Miguel de Cervantes')).toBe(
      'https://gutenberg.org/quijote.epub'
    );
  });

  it('devuelve null si el libro no está en dominio público', () => {
    expect(matchReadableSource(sources, 'Harry Potter', 'J.K. Rowling')).toBeNull();
  });

  it('no explota con lista vacía o título vacío', () => {
    expect(matchReadableSource([], 'Dracula', 'Stoker')).toBeNull();
    expect(matchReadableSource(sources, '', '')).toBeNull();
  });
});
