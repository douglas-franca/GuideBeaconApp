import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Device = {
  name: string;
  description: string;
  rssi?: number | null;
};

type DeviceStore = {
  devices: Device[];
  isLoaded: boolean;
  getDevices: () => Device[];
  setDevices: (devices: Device[]) => void;
  updateDevice: (device: Device) => Promise<void>;
  loadDevices: () => Promise<void>;
};

const STORAGE_KEY = '@GuideBeaconApp:devices';

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: [],
  isLoaded: false,

  getDevices: () => get().devices,

  setDevices: (devices: Device[]) => set({ devices }),

  loadDevices: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const devices = JSON.parse(stored);
        set({ devices, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      console.error('Error loading devices from storage:', error);
      set({ isLoaded: true });
    }
  },

  updateDevice: async (device: Device) => {
    const devices = [...get().devices];

    const index = devices.findIndex((d) => d.name === device.name);
    if (index !== -1) {
      devices[index] = device;
    } else {
      devices.push(device);
    }

    set({ devices });

    // Save to AsyncStorage
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(devices));
    } catch (error) {
      console.error('Error saving devices to storage:', error);
    }
  },
}));
