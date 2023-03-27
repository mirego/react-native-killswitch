import { useCallback, useEffect, useRef, useState } from 'react';
import usePrevious from './hooks/use-previous';
import { useAppState } from './hooks/use-app-state';
import Killswitch from './killswitch';

interface UseKillswitchOptions {
  iosApiKey: string;
  androidApiKey: string;
  language: string;
  version: string;
  apiHost: string;
  useNativeUI?: boolean;
  timeout?: number;
}

export function useKillswitch({
  iosApiKey,
  androidApiKey,
  language,
  version,
  apiHost,
  useNativeUI = true,
  timeout = 2000,
}: UseKillswitchOptions) {
  const killswitchRef = useRef<Killswitch | null>(null);
  const appState = useAppState();
  const previousAppState = usePrevious(appState);
  const [isOk, setIsOk] = useState<boolean | null>(null);

  const getKillswitch = useCallback(() => {
    if (killswitchRef.current !== null) return killswitchRef.current;

    const killswitch = new Killswitch({
      iosApiKey,
      androidApiKey,
      apiHost,
      useNativeUI,
      timeout,
    });

    killswitchRef.current = killswitch;

    return killswitch;
  }, [androidApiKey, apiHost, iosApiKey, timeout, useNativeUI]);

  useEffect(() => {
    async function run() {
      if (previousAppState !== 'active' && appState === 'active') {
        const { isOk: newIsOk } = await getKillswitch().check(
          language,
          version
        );

        setIsOk(newIsOk);
      }
    }

    run();
  }, [appState, getKillswitch, language, previousAppState, version]);

  return { isOk, killswitch: killswitchRef.current };
}
