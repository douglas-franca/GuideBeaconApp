import { create } from 'zustand';

type Device = {
  serviceDataUuid: string;
  name: string;
  description: string;
};

type DeviceStore = {
  devices: Device[];
  getDevices: () => Device[];
  getDeviceByServiceUuid: (uuid: string) => Device | undefined;
  getServiceUuids: () => string[];
};

// TODO: Load devices from a remote source or local storage if needed
// JUST A MOCK FOR NOW
const defaultDevices: Device[] = [
  {
    serviceDataUuid: '0000fe2c-0000-1000-8000-00805f9b34fb',
    name: 'JBL WAVE BUDS-LE',
    description: 'This is my JBL Bluetooth Headset',
  },
  {
    serviceDataUuid: '0000fddf-0000-1000-8000-00805f9b34fb',
    name: 'Holy-IOT',
    description: 'This is my Holy-IOT device',
  },
];

export const useDeviceStore = create<DeviceStore>((set, get) => ({
  devices: defaultDevices,


  getDevices: () => get().devices,

  getDeviceByServiceUuid: (uuid: string) => get().devices.find((device) => device.serviceDataUuid === uuid),

  getServiceUuids: () => get().devices.map((device) => device.serviceDataUuid),
}));
