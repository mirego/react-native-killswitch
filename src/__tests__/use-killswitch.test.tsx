import { act, render, screen, waitFor } from '@testing-library/react-native';
import {
  Alert,
  AppState,
  BackHandler,
  Linking,
  Text,
  View,
} from 'react-native';
import React from 'react';
import { useKillswitch } from '../use-killswitch';
import fetchMock from 'jest-fetch-mock';
import spyOnAlert from '../__utils__/spy-on-alert';

function App() {
  const { isOk } = useKillswitch({
    iosApiKey: 'apiKey',
    androidApiKey: 'apiKey',
    language: 'en',
    version: '1.0.0',
    apiHost: 'https://killswitch.mirego.com',
    timeout: 200,
  });

  return (
    <View>
      <Text testID="killswitch-text">
        {isOk == null ? 'pending' : isOk ? 'is ok' : 'is not ok'}
      </Text>
    </View>
  );
}

describe('useKillswitch()', () => {
  let appStateSpy: jest.SpyInstance;

  beforeEach(() => {
    AppState.currentState = 'active';

    appStateSpy = jest
      .spyOn(AppState, 'addEventListener')
      .mockImplementation(() => {
        return { remove: jest.fn() };
      });

    fetchMock.enableMocks();
  });

  afterEach(() => {
    fetchMock.resetMocks();

    appStateSpy.mockReset();
    appStateSpy.mockRestore();
  });

  describe('when it receives an "ok" signal', () => {
    beforeEach(() => {
      fetchMock.mockResponse((_request) => {
        return Promise.resolve(JSON.stringify({ action: 'ok' }));
      });
    });

    it('should return `isOk = true`', async () => {
      render(<App />);

      await waitFor(() => screen.getByText('is ok'));
    }, 8000);
  });

  describe('when it receives an "alert" signal', () => {
    beforeEach(() => {
      fetchMock.mockResponse((_request) => {
        return Promise.resolve(
          JSON.stringify({
            action: 'alert',
            message: 'This is an alert message!',
            buttons: [
              { type: 'cancel', label: 'OK' },
              { type: 'url', label: 'More info', url: 'https://mirego.com' },
            ],
          })
        );
      });
    });

    it('should return `isOk = true`', async () => {
      render(<App />);

      await screen.findByText('is ok');
    });

    it('should show an alert', async () => {
      const { restore } = spyOnAlert();

      render(<App />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          '',
          'This is an alert message!',
          [
            expect.objectContaining({ style: 'cancel', text: 'OK' }),
            expect.objectContaining({ style: 'default', text: 'More info' }),
          ],
          { cancelable: false }
        );
      });

      restore();
    });

    describe('alert buttons', () => {
      beforeEach(() => {
        jest.spyOn(Linking, 'openURL');
        jest.spyOn(BackHandler, 'exitApp');
      });

      afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
      });

      it('should render a cancel button if one is returned by the back-end', async () => {
        const { pressAlertButton, restore } = spyOnAlert();

        render(<App />);

        await waitFor(() => {
          expect(Alert.alert).toHaveBeenCalled();
        });

        await pressAlertButton('OK');

        expect(Linking.openURL).toHaveBeenCalledTimes(0);

        expect(BackHandler.exitApp).toHaveBeenCalledTimes(0);

        // Make sure the alert does not pop back up after clicking a button
        expect(Alert.alert).toHaveBeenCalledTimes(1);

        restore();
      });

      it('should render a link button if one is returned by the back-end', async () => {
        const { pressAlertButton, restore } = spyOnAlert();

        render(<App />);

        await waitFor(() => {
          expect(Alert.alert).toHaveBeenCalled();
        });

        await pressAlertButton('More info');

        expect(Linking.openURL).toHaveBeenCalledWith('https://mirego.com');

        // Make sure there was no subsequent calls to Alert
        expect(Alert.alert).toHaveBeenCalledTimes(1);

        restore();
      });
    });
  });

  describe('when it receives a "kill" signal', () => {
    beforeEach(() => {
      fetchMock.mockResponse((_request) => {
        return Promise.resolve(
          JSON.stringify({
            action: 'kill',
            message: 'This is a kill message!',
            buttons: [
              {
                type: 'cancel',
                label: 'OK',
              },
              {
                type: 'url',
                label: 'Download the new version',
                url: 'https://mirego.com',
              },
            ],
          })
        );
      });
    });

    it('should return `isOk = false`', async () => {
      render(<App />);

      await screen.findByText('is not ok');
    });

    it('should show an alert', async () => {
      const { restore } = spyOnAlert();

      render(<App />);

      await waitFor(() => {
        expect(Alert.alert).toHaveBeenCalledWith(
          '',
          'This is a kill message!',
          [
            expect.objectContaining({ style: 'cancel', text: 'OK' }),
            expect.objectContaining({
              style: 'default',
              text: 'Download the new version',
            }),
          ],
          { cancelable: false }
        );
      });

      restore();
    });

    describe('alert buttons', () => {
      beforeEach(() => {
        jest.spyOn(Linking, 'openURL');
        jest.spyOn(BackHandler, 'exitApp');
      });

      afterEach(() => {
        jest.resetAllMocks();
        jest.restoreAllMocks();
      });

      it('should render a cancel button if one is returned by the back-end', async () => {
        const { pressAlertButton, restore } = spyOnAlert();

        render(<App />);

        await waitFor(() => {
          expect(Alert.alert).toHaveBeenCalled();
        });

        await pressAlertButton('OK');

        expect(Linking.openURL).toHaveBeenCalledTimes(0);

        expect(BackHandler.exitApp).toHaveBeenCalledTimes(1);

        // Make sure the alert pops back up after clicking a button
        expect(Alert.alert).toHaveBeenCalledTimes(2);

        restore();
      });

      it('should render a link button if one is returned by the back-end', async () => {
        const { pressAlertButton, restore } = spyOnAlert();

        render(<App />);

        await waitFor(() => {
          expect(Alert.alert).toHaveBeenCalled();
        });

        await pressAlertButton('Download the new version');

        expect(Linking.openURL).toHaveBeenCalledWith('https://mirego.com');

        expect(BackHandler.exitApp).toHaveBeenCalledTimes(1);

        // Make sure the alert pops back up after clicking a button
        expect(Alert.alert).toHaveBeenCalledTimes(2);

        restore();
      });
    });
  });

  describe('when it receives an error payload from the back-end', () => {
    beforeEach(() => {
      fetchMock.mockResponse((_request) => {
        return Promise.resolve(
          JSON.stringify({
            error: 'not_found',
          })
        );
      });
    });

    it('should not block anything and return `isOk = true`', async () => {
      const { restore } = spyOnAlert();

      render(<App />);

      await screen.findByText('is ok');

      expect(Alert.alert).toHaveBeenCalledTimes(0);

      restore();
    });
  });

  describe('when it throws an error while fetching the behavior', () => {
    beforeEach(() => {
      fetchMock.mockReject();
    });

    it('should not block anything and return `isOk = true`', async () => {
      const { restore } = spyOnAlert();

      render(<App />);

      await screen.findByText('is ok');

      expect(Alert.alert).toHaveBeenCalledTimes(0);

      restore();
    });
  });

  describe('when it times out while fetching the behavior', () => {
    beforeEach(() => {
      fetchMock.disableMocks();
      jest.useFakeTimers();

      jest.spyOn(global, 'setTimeout');
    });

    afterEach(() => {
      jest.clearAllTimers();

      jest.resetAllMocks();
      jest.restoreAllMocks();
    });

    it('should not block anything and return `isOk = true`', () => {
      const { restore } = spyOnAlert();

      render(<App />);

      expect(global.setTimeout).toHaveBeenCalledTimes(1);
      expect(global.setTimeout).toHaveBeenCalledWith(expect.anything(), 200);

      act(() => {
        jest.runAllTimers();
      });

      screen.findByText('is ok', {}, { timeout: 500 });

      expect(Alert.alert).toHaveBeenCalledTimes(0);

      restore();
    });
  });
});
