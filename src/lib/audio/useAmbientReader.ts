'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AmbientEngine } from './ambientEngine';
import { detectScene, type AmbientScene } from './sceneDetector';

/**
 * Conecta el motor de ambiente con el texto de la página actual.
 * - `toggle()` prende/apaga (el primer prendido cuenta como el gesto de
 *   usuario que exige la política de autoplay del navegador).
 * - Mientras está activo, sigue la escena detectada en el texto y hace
 *   crossfade automático al cambiar de página.
 */
export function useAmbientReader(pageText: string) {
  const engineRef = useRef<AmbientEngine | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [scene, setScene] = useState<AmbientScene | null>(null);

  const detected = useMemo(() => detectScene(pageText), [pageText]);

  const toggle = useCallback(async () => {
    if (!engineRef.current) engineRef.current = new AmbientEngine();
    const engine = engineRef.current;

    if (enabled) {
      engine.setScene(null);
      setEnabled(false);
    } else {
      await engine.enable();
      setEnabled(true);
    }
  }, [enabled]);

  // Aplicar la escena detectada mientras el sonido está activo.
  useEffect(() => {
    if (!enabled || !engineRef.current) return;
    engineRef.current.setScene(detected);
    setScene(detected);
  }, [detected, enabled]);

  useEffect(() => {
    if (!enabled) setScene(null);
  }, [enabled]);

  // Liberar el AudioContext al desmontar el lector.
  useEffect(() => {
    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, []);

  return { enabled, toggle, scene };
}
