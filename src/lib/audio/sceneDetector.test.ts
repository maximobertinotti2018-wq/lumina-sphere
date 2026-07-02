import { describe, it, expect } from 'vitest';
import { detectScene } from './sceneDetector';

describe('detectScene', () => {
  it('detecta lluvia', () => {
    expect(detectScene('La lluvia caía sin parar sobre el tejado.')).toBe('rain');
    expect(detectScene('The storm raged and thunder shook the house.')).toBe('rain');
  });

  it('detecta tensión/oscuridad', () => {
    expect(detectScene('Todo estaba oscuro y un grito rompió el silencio.')).toBe('tension');
    expect(detectScene('A shadow of dread and fear filled the room.')).toBe('tension');
  });

  it('detecta fuego', () => {
    expect(detectScene('Las llamas de la hoguera crepitaban en la noche.')).toBe('fire');
  });

  it('detecta mar', () => {
    expect(detectScene('Las olas del océano rompían contra la orilla.')).toBe('sea');
  });

  it('detecta viento', () => {
    expect(detectScene('El viento helado soplaba entre la nieve.')).toBe('wind');
  });

  it('normaliza acentos', () => {
    expect(detectScene('la lluvia y los relámpagos')).toBe('rain');
  });

  it('devuelve null sin señales', () => {
    expect(detectScene('Se sentaron a conversar tranquilamente en la mesa.')).toBeNull();
    expect(detectScene('')).toBeNull();
  });

  it('elige la escena dominante cuando hay varias', () => {
    // Más señales de lluvia que de otra cosa.
    const text = 'Llovía. La lluvia y la tormenta traían truenos, aunque una vela ardía.';
    expect(detectScene(text)).toBe('rain');
  });

  it('NO detecta por substring (regresión: falsos positivos)', () => {
    // "Marcos" contiene "mar", pero no es el mar.
    expect(detectScene('Marcos caminaba pensando en su marca personal.')).toBeNull();
    // "season" contiene "sea", "window" contiene "wind", "brain"/"training" contienen "rain".
    expect(detectScene('The season changed and she looked out the window.')).toBeNull();
    expect(detectScene('He used his brain during the training.')).toBeNull();
  });

  it('detecta mar solo como palabra real', () => {
    expect(detectScene('El mar rugía y las olas golpeaban la costa.')).toBe('sea');
  });
});
