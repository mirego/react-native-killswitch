import {
  Alert,
  AlertButton,
  BackHandler,
  Linking,
  Platform,
} from 'react-native';
import { z } from 'zod';

enum KillswitchButtonType {
  CANCEL = 'cancel',
  URL = 'url',
}

enum KillswitchBehaviorAction {
  OK = 'ok',
  ALERT = 'alert',
  KILL = 'kill',
}

const KillswitchButton = z.object({
  type: z.nativeEnum(KillswitchButtonType),
  label: z.string(),
  url: z.optional(z.string()),
});

const KillswitchBehavior = z.object({
  action: z.nativeEnum(KillswitchBehaviorAction),
  message: z.optional(z.string()),
  buttons: z.optional(z.array(KillswitchButton)),
});

const BUTTON_STYLE_MAPPING: Record<KillswitchButtonType, AlertButton['style']> =
  {
    [KillswitchButtonType.CANCEL]: 'cancel',
    [KillswitchButtonType.URL]: 'default',
  };

interface KillswitchOptions {
  apiHost: string;
  iosApiKey: string;
  androidApiKey: string;
  useNativeUI?: boolean;
  timeout?: number;
  enabled?: boolean;
}

class Killswitch {
  apiHost: string;
  iosApiKey: string;
  androidApiKey: string;
  useNativeUI: boolean;
  timeout: number;
  enabled: boolean;

  behavior?: z.infer<typeof KillswitchBehavior>;

  constructor({
    apiHost,
    iosApiKey,
    androidApiKey,
    useNativeUI = true,
    timeout = 2000,
    enabled = true,
  }: KillswitchOptions) {
    this.apiHost = apiHost;
    this.iosApiKey = iosApiKey;
    this.androidApiKey = androidApiKey;
    this.useNativeUI = useNativeUI;
    this.timeout = timeout;
    this.enabled = enabled;
  }

  get isOk() {
    return this.behavior?.action === KillswitchBehaviorAction.OK;
  }

  get isAlert() {
    return this.behavior?.action === KillswitchBehaviorAction.ALERT;
  }

  get isKill() {
    return this.behavior?.action === KillswitchBehaviorAction.KILL;
  }

  async check(language: string, version: string, enabled: boolean) {
    if (!enabled) return { isOk: true };
    try {
      const payload = await this.fetch(language, version);

      this.behavior = KillswitchBehavior.parse(payload);

      if (this.useNativeUI) {
        await this.maybeShowAlert();
      }

      return {
        isOk: this.behavior?.action !== KillswitchBehaviorAction.KILL,
      };
    } catch (error) {
      console.error('[Killswitch] Fetch behaviour failed with error:', error);

      return { isOk: true };
    }
  }

  private async fetch(
    language: string,
    version: string
  ): Promise<z.infer<typeof KillswitchBehavior>> {
    const controller = new AbortController();
    const signal = controller.signal;

    const timeout = setTimeout(() => {
      controller.abort();
    }, this.timeout);

    try {
      const key = Platform.OS === 'ios' ? this.iosApiKey : this.androidApiKey;

      const response = await fetch(
        `${this.apiHost}/killswitch?version=${version}&key=${key}`,
        {
          headers: { 'Accept-Language': language },
          signal,
        }
      );
      return response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  private maybeShowAlert() {
    if (!this.behavior) return;

    if (this.isOk) {
      return;
    }

    if (!this.enabled) {
      return;
    }

    if (this.isAlert || this.isKill) {
      return Alert.alert('', this.behavior.message, this.buildAlertButtons(), {
        cancelable: false,
      });
    }
  }

  private buildAlertButtons() {
    return this.behavior?.buttons?.map((button) => {
      return {
        text: button.label,
        style: BUTTON_STYLE_MAPPING[button.type],
        onPress: async () => this.onAlertButtonPress(button),
      };
    });
  }

  private async onAlertButtonPress(button: z.infer<typeof KillswitchButton>) {
    if (button.url) {
      try {
        await Linking.openURL(button.url);
      } catch (error) {
        console.error(`[Killswitch] Failed to open URL: ${button.url}`);
      } finally {
        this.maybeKillAppOrShowAlertAgain();
      }
    } else {
      this.maybeKillAppOrShowAlertAgain();
    }
  }

  private async maybeKillAppOrShowAlertAgain() {
    if (this.behavior?.action === KillswitchBehaviorAction.KILL) {
      // On Android we are allowed to kill the app so the code below won't have
      // any effect.
      BackHandler.exitApp();

      // On iOS, the app cannot be killed and we still need to block the user
      // so we show them the alert again.
      await this.maybeShowAlert();
    }
  }
}

export default Killswitch;
