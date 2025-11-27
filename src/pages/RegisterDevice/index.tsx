import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Device } from 'react-native-ble-plx';
import SearchDevices from '../../components/SearchDevices';

import { useDeviceStore } from '../../stores/DeviceStore';

type RootStackParamList = {
  Home: undefined;
  RegisterDevice: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'RegisterDevice'>;

const RegisterDevice: React.FC<Props> = ({ navigation }) => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [deviceDescription, setDeviceDescription] = useState('');

  const updateDevice = useDeviceStore((state) => state.updateDevice);

  const handleDeviceSelect = (device: Device) => {
    setSelectedDevice(device);
    setDeviceDescription('');
  };

  const handleRegister = () => {
    if (!selectedDevice || !selectedDevice.name?.trim()) {
      Alert.alert('Error', 'Please select a device and provide a name');
      return;
    }

    updateDevice({
      name: selectedDevice.name,
      description: deviceDescription,
      rssi: selectedDevice.rssi,
    });

    Alert.alert('Success', 'Device registered successfully', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  const handleCancel = () => {
    if (selectedDevice) {
      setSelectedDevice(null);
      setDeviceDescription('');
    } else {
      navigation.goBack();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Register New Device</Text>
        <Text style={styles.subtitle}>
          {selectedDevice
            ? 'Enter device details'
            : 'Select a device from nearby Bluetooth devices'}
        </Text>

        {!selectedDevice && (
          <SearchDevices
            onDevicesFound={(foundDevices, scanning) => {
              console.log('Devices found:', foundDevices);
              setDevices(foundDevices);
              setIsScanning(scanning);
            }}
          />
        )}

        {!selectedDevice ? (
          <View style={styles.devicesList}>
            <View style={styles.devicesHeader}>
              <Text style={styles.devicesTitle}>
                Nearby Devices ({devices.length})
              </Text>
              {isScanning && <ActivityIndicator size="small" color="#007AFF" />}
            </View>

            {devices.length === 0 && !isScanning && (
              <Text style={styles.noDevices}>
                No devices found. Make sure Bluetooth is enabled.
              </Text>
            )}

            {devices.map((device) => (
              <TouchableOpacity
                key={device.id}
                style={styles.deviceCard}
                onPress={() => handleDeviceSelect(device)}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceCardName}>
                    {device.name || 'Unknown Device'}
                  </Text>
                  <Text style={styles.deviceCardId}>{device.id}</Text>
                  {device.rssi && (
                    <Text style={styles.deviceCardRssi}>
                      Signal: {device.rssi} dBm
                    </Text>
                  )}
                </View>
                <Text style={styles.selectArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.form}>
            <View style={styles.selectedDeviceInfo}>
              <Text style={styles.selectedLabel}>Selected Device</Text>
              <Text style={styles.selectedId}>{selectedDevice.id}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Device Name *</Text>
              <Text>
                {selectedDevice.name || 'Unknown Device'}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g., Located at main entrance"
                value={deviceDescription}
                onChangeText={setDeviceDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Register Device</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.buttonSecondary}
              onPress={handleCancel}>
              <Text style={styles.buttonSecondaryText}>Back to List</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  devicesList: {
    marginTop: 8,
  },
  devicesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  devicesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  noDevices: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 24,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  deviceCardId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  deviceCardRssi: {
    fontSize: 12,
    color: '#888',
  },
  selectArrow: {
    fontSize: 24,
    color: '#007AFF',
    marginLeft: 12,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  selectedDeviceInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  selectedId: {
    fontSize: 14,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e4e8',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  buttonSecondaryText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterDevice;
