import { Alert, AlertButton } from 'react-native';

interface MockAlertActions {
  pressAlertButton(text: string): Promise<void>;
  restore(): void;
}

export default function spyOnAlert(): MockAlertActions {
  let alertSpy = jest.spyOn(Alert, 'alert');

  return {
    async pressAlertButton(text: string): Promise<void> {
      const unhandledCalls = [...alertSpy.mock.calls];

      if (unhandledCalls.length === 0) {
        throw new Error('No pending calls to alert');
      }

      const mostRecentCall = unhandledCalls[unhandledCalls.length - 1]!;

      const targetButton = mostRecentCall[2]?.find(
        (button: AlertButton) => button.text === text
      );

      if (!targetButton) {
        throw new Error(`No button with text ${text}`);
      }

      if (targetButton.onPress) {
        await targetButton.onPress();
      }
    },

    restore() {
      alertSpy.mockRestore();
    },
  };
}
