import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import Tts from 'react-native-tts';
import SearchDevices from '../../components/SearchDevices';

import { useDeviceStore } from '../../stores/DeviceStore';

type RootStackParamList = {
  Home: undefined;
  RegisterDevice: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

// Will check the bluetooths and check is in store, if yes will say the description, if the ssri is better than the stored, will say you are more close
const Home: React.FC<Props> = ({ navigation }) => {
  const lastDevicesRef = React.useRef<any[]>([]);
  const [nearbyDevices, setNearbyDevices] = React.useState<any[]>([]);
  const [isScreenFocused, setIsScreenFocused] = React.useState(true);

  const {
    getDevices,
    loadDevices,
  } = useDeviceStore();

  // Load devices from storage on mount
  React.useEffect(() => {
    loadDevices();
  }, [loadDevices]);

  // Listen to screen focus/blur events
  useFocusEffect(
    React.useCallback(() => {
      // Screen is focused
      setIsScreenFocused(true);
      
      return () => {
        // Screen is blurred (navigated away)
        setIsScreenFocused(false);
      };
    }, [])
  );  React.useEffect(() => {
    // Initialize TTS
    Tts.setDefaultLanguage('pt-BR');
    Tts.setDefaultRate(0.5);
    Tts.setDefaultPitch(1.0);
  }, []);

  const speak = (text: string) => {
    Tts.stop();
    Tts.speak(text);
  };

  const onUpdateDevices = (devices: any[]) => {
    const storedDevices = getDevices();

    console.log('Dispositivos encontrados:', storedDevices);

    // Filter devices that are registered in the store
    const matchedDevices = devices
      .map((device) => {
        const matched = storedDevices.find((d) => d.name === device.name);
        if (matched) {
          return {
            ...device,
            description: matched.description,
          };
        }
        return null;
      })
      .filter((d) => d !== null);

    if (matchedDevices.length === 0) {
      lastDevicesRef.current = [];
      setNearbyDevices([]);
      return;
    }

    // Sort by RSSI (higher is closer/stronger signal)
    const sortedBySignal = matchedDevices.sort((a, b) => (b.rssi || -100) - (a.rssi || -100));
    
    // Get top 4 closest devices to display
    const topDevices = sortedBySignal.slice(0, 4);
    setNearbyDevices(topDevices);

    const closestDevice = sortedBySignal[0];
    console.log('Last devices before comparison:', lastDevicesRef.current);
    const previousClosest = lastDevicesRef.current.length > 0 
      ? lastDevicesRef.current.sort((a, b) => (b.rssi || -100) - (a.rssi || -100))[0]
      : null;

    // Announce the closest device
    if (!previousClosest || previousClosest.name !== closestDevice.name) {
      const message = `Você está próximo de ${closestDevice.description}`;
      speak(message);
    } else if (previousClosest && closestDevice.rssi && previousClosest.rssi) {
      const rssiDifference = closestDevice.rssi - previousClosest.rssi;

      // Announce if getting closer (RSSI improved by more than 3 dBm)
      if (rssiDifference > 5) {
        const message = `Você está se aproximando de ${closestDevice.description}`;
        speak(message);
      }
      // Announce if getting farther (RSSI decreased by more than 3 dBm)
      else if (rssiDifference < -5) {
        const message = `Você está se afastando de ${closestDevice.description}`;
        speak(message);
      }
    }

    // Save matched devices (with descriptions) for next comparison
    lastDevicesRef.current = matchedDevices;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>GuideBeaconApp</Text>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('RegisterDevice')}>
          <Text style={styles.registerButtonText}>+ Register Device</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isScreenFocused && (
          <SearchDevices
            onDevicesFound={(devices) => {
              onUpdateDevices(devices);
            }}
          />
        )}

        <View style={styles.devicesContainer}>
          <Text style={styles.sectionTitle}>Dispositivos Próximos</Text>
          {nearbyDevices.length === 0 ? (
            <Text style={styles.noDevices}>Nenhum dispositivo registrado próximo</Text>
          ) : (
            nearbyDevices.map((device, index) => (
              <View key={device.id} style={styles.deviceItem}>
                <View style={styles.deviceRank}>
                  <Text style={styles.rankNumber}>{index + 1}</Text>
                </View>
                <View style={styles.deviceDetails}>
                  <Text style={styles.deviceDescription}>{device.description}</Text>
                  <Text style={styles.deviceSignal}>
                    Sinal: {device.rssi} dBm
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e4e8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  devicesContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  noDevices: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 24,
  },
  deviceItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  deviceRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  deviceDetails: {
    flex: 1,
  },
  deviceDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  deviceSignal: {
    fontSize: 14,
    color: '#666',
  },
});

export default Home;
