import { useEffect, useRef, useState } from 'react';
import usePrevious from './hooks/use-previous';
import { useAppState } from './hooks/use-app-state';
import Killswitch from './killswitch';

interface UseKillswitchOptions {
  iosApiKey: string;
  androidApiKey: string;
  language: string;
  version: string;
  apiHost?: string;
  useNativeUI?: boolean;
  timeout?: number;
}

export function useKillswitch({
  iosApiKey,
  androidApiKey,
  language,
  version,
  apiHost = 'https://killswitch.mirego.com',
  useNativeUI = true,
  timeout = 2000,
}: UseKillswitchOptions) {
  const killswitch = useRef(
    new Killswitch({ iosApiKey, androidApiKey, apiHost, useNativeUI, timeout })
  );

  const appState = useAppState();
  const previousAppState = usePrevious(appState);

  const [isOk, setIsOk] = useState<boolean | null>(null);

  useEffect(() => {
    async function run() {
      if (previousAppState !== 'active' && appState === 'active') {
        const { isOk: newIsOk } = await killswitch.current.check(
          language,
          version
        );

        setIsOk(newIsOk);
      }
    }

    run();
  }, [appState, language, previousAppState, version]);

  return { isOk, killswitch: killswitch.current };
}
