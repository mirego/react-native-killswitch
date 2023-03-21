import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { useKillswitch } from 'react-native-killswitch';

export default function App() {
  const { isOk } = useKillswitch({
    iosApiKey:
      'a351227e97198cb4d71e6433ef7afcc185b49b8c364874b5129aacd08b576f59',
    androidApiKey:
      'a351227e97198cb4d71e6433ef7afcc185b49b8c364874b5129aacd08b576f59',
    language: 'fr',
    version: '0.10.0',
  });

  return (
    <View style={styles.container}>
      <Text>
        Result: {isOk == null ? 'pending' : isOk ? 'is ok' : 'is not ok'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
