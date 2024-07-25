<div align="center">
  <img src="https://user-images.githubusercontent.com/425073/227933488-ddd066e5-10ca-4946-97ad-60268dfe894c.png" width="700">

  <p>
    <strong>React Native Killswitch</strong> is a library built by <a href="https://www.mirego.com">Mirego</a> that allows mobile developers to apply<br /> runtime version-specific behaviors to their React Native application.
  </p>

<a href="https://github.com/mirego/react-native-killswitch/actions/workflows/ci.yaml"><img src="https://github.com/mirego/react-native-killswitch/actions/workflows/ci.yaml/badge.svg?branch=main" /></a>
<a href="https://github.com/mirego/react-native-killswitch/tags"><img src="https://img.shields.io/npm/v/react-native-killswitch.svg"></a><br /><br />

</div>

## What is Killswitch?

[Killswitch is a clever control panel](https://github.com/mirego/killswitch) built by Mirego that allows mobile developers to apply runtime version-specific behaviors to their iOS or Android application.

## Installation

```sh
npm install react-native-killswitch
```

## Usage

The bare minimum needed to have a working killswitch is API keys for iOS and Android,
the app language and the app version:

```js
import { useKillswitch } from 'react-native-killswitch';

const { isOk } = useKillswitch({
  iosApiKey: iosApiKey,
  androidApiKey: androidApiKey,
  language: myAppLanguage,
  version: myAppVersion,
  enabled: true,
});
```

### Options

- `iosApiKey`
  A string taken from your killswitch back-end. The killswitch back-end will use
  this to send the correct behavior to your iOS users.

- `androidApiKey`
  A string taken from your killswitch back-end. The killswitch back-end will use
  this to send the correct behavior to your Android users.

- `language`
  A language code like "en" or "de". The killswitch back-end will use this to
  send a localized message to your users.

- `version`
  A version number like "1.0.0". The killswitch back-end will use this to send
  the correct behavior to your users.

- `apiHost`
  The host of the killswitch back-end.

- `useNativeUI`
  Use native alerts to display messages. Defaults to `true`

- `timeout`
  A number of milliseconds to wait for the back-end before returning `isOk = true`. Defaults to `2000`

- `enabled`
  Toggle if you want to disabled. Defaults to `true`

## License

react-native-killswitch is © 2023 [Mirego](https://www.mirego.com) and may be freely distributed under the [New BSD license](http://opensource.org/licenses/BSD-3-Clause). See the [`LICENSE.md`](./LICENSE.md) file.

The shield logo is based on [this lovely icon by Kimmi Studio](https://thenounproject.com/icon/shield-1055246/), from The Noun Project. Used under a [Creative Commons BY 3.0](http://creativecommons.org/licenses/by/3.0/) license.

## About Mirego

[Mirego](https://www.mirego.com) is a team of passionate people who believe that work is a place where you can innovate and have fun. We’re a team of [talented people](https://life.mirego.com) who imagine and build beautiful Web and mobile applications. We come together to share ideas and [change the world](http://www.mirego.org).

We also [love open-source software](https://open.mirego.com) and we try to give back to the community as much as we can.
