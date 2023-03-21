import { useEffect, useRef } from 'react';

type UsePreviousConfig = {
  startWithInitialValue?: boolean;
};

export default function usePrevious<T>(
  value: T,
  { startWithInitialValue = false }: UsePreviousConfig = {}
): T | undefined {
  const ref = useRef<T | undefined>(startWithInitialValue ? value : undefined);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
