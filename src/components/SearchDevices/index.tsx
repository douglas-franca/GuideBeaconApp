import React, { useState, useEffect, useCallback, useRef } from 'react';

import { BleManager } from 'react-native-ble-plx';

import { requestBluetoothPermissions } from '../../services/devices/permissions';
import { useDeviceStore } from '../../stores/DeviceStore';
import { Text, View } from 'react-native';

const manager = new BleManager();

const INTERVAL_SCAN = 2000; // 3 seconds
const TIMEOUT_SCAN = 10000; // 15 seconds

function SearchDevices() {
  const [isScanning, setIsScanning] = useState(false);
  const [device, setDevice] = useState(null);
  const [currentDevice, setCurrentDevice] = useState(null);
  const getDeviceByServiceUuid = useDeviceStore((state) => state.getDeviceByServiceUuid);

  const intervalRef = useRef(null);

  const setNearDevice = useCallback((deviceFromScan) => {
    if (!device) {
      setDevice(deviceFromScan);
    }
    console.log('Dispositivo encontrado no scan:', deviceFromScan.name, deviceFromScan.rssi, deviceFromScan.serviceData);
    if (
      deviceFromScan.rssi
      && (
        !device?.rssi
        || (device.rssi > deviceFromScan.rssi)
      )
    ) {
      setDevice(deviceFromScan);
    }

    console.log('Dispositivo com maior RSSI:', deviceFromScan.name, deviceFromScan.serviceData);
    const serviceDataUuids = Object.keys(deviceFromScan.serviceData || {});
    if (serviceDataUuids.length > 0) {
      serviceDataUuids.forEach((serviceUuid) => {
        // const serviceUuid = serviceDataUuids[0];
        const foundDevice = getDeviceByServiceUuid(serviceUuid);

        if (foundDevice && foundDevice !== currentDevice) {
          setCurrentDevice(foundDevice);
          console.log('Dispositivo mais próximo:', foundDevice);
        }
      });
    }
  }, [device, getDeviceByServiceUuid, currentDevice]);

  const scanDevices = async () => {
    const permissionGranted = await requestBluetoothPermissions();
    if (!permissionGranted) {
      console.log('Permissão de localização não concedida');
      return;
    }

    setIsScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Error in startDeviceScan', error);
        return;
      }
      if (device) {
        setNearDevice(device);
      }
    });

    // Para o escaneamento após um tempo definido
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, INTERVAL_SCAN);
  };

  useEffect(() => {
    // Inicia o primeiro escaneamento
    scanDevices();

    // Configura um intervalo para chamar scanDevices periodicamente
    intervalRef.current = setInterval(scanDevices, TIMEOUT_SCAN);

    // Função de limpeza
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      manager.stopDeviceScan();
    };
  }, []);

  return <View>
    <Text>Dispositivo mais próximo:</Text>
    {currentDevice ? (
      <View>
        <Text>Nome: {currentDevice.name}</Text>
        <Text>Descrição: {currentDevice.description}</Text>
        <Text>UUID: {currentDevice.uuid}</Text>
      </View>
    ) : (
      <Text>Nenhum dispositivo próximo encontrado.</Text>
    )}
  </View>;
}

export default SearchDevices;
