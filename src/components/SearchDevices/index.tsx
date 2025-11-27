import { useEffect, useRef, useCallback } from 'react';

import { BleManager, Device } from 'react-native-ble-plx';

import { requestBluetoothPermissions } from '../../services/devices/permissions';

const manager = new BleManager();

const TIMEOUT_SCAN = 8000; // 8 seconds between scans

type SearchDevicesProps = {
  scanDuration?: number;
  repeatInterval?: number;
  onDevicesFound?: (devices: Device[], isScanning: boolean) => void;
};

function SearchDevices({ 
  repeatInterval = TIMEOUT_SCAN, 
  onDevicesFound 
}: SearchDevicesProps) {
  const devicesRef = useRef<Device[]>([]);
  const isScanningRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const notifyParent = useCallback((devices: Device[], scanning: boolean) => {
    if (onDevicesFound) {
      onDevicesFound(devices, scanning);
    }
  }, [onDevicesFound]);

  const stopScan = useCallback(async () => {
    if (!isScanningRef.current) {
      return;
    }
    
    await manager.stopDeviceScan();
    isScanningRef.current = false;

    console.log(`Escaneamento finalizado. ${devicesRef.current.length} dispositivos encontrados.`);
    notifyParent(devicesRef.current, false);
  }, [notifyParent]);

  const scanDevices = useCallback(async () => {
    const permissionGranted = await requestBluetoothPermissions();
    if (!permissionGranted) {
      console.log('Permissão Bluetooth não concedida');
      notifyParent([], false);
      return;
    }

    await stopScan();
    
    isScanningRef.current = true;
    devicesRef.current = [];
    console.log('Iniciando escaneamento de dispositivos Bluetooth...');

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Error in startDeviceScan:', error);
        return;
      }
      
      if (device && isScanningRef.current) {
        // Add device if not already in the list
        const exists = devicesRef.current.find((d) => d.name === device.name);
        if (!exists) {
          devicesRef.current = [...devicesRef.current, device];
        } else {
          // Update existing device info
          devicesRef.current = devicesRef.current.map((d) =>
            d.name === device.name ? device : d
          );
        }
      }
    });

  }, [notifyParent, stopScan]);

  useEffect(() => {
    // Start first scan immediately
    scanDevices();

    // Set up repeated scanning if repeatInterval is provided
    if (repeatInterval > 0) {
      intervalRef.current = setInterval(scanDevices, repeatInterval);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      manager.stopDeviceScan();
    };
  }, []);

  return null;
}

export default SearchDevices;