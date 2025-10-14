import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import type { Permission } from 'react-native-permissions';

// TODO: Add iOS permissions handling if needed
export async function requestBluetoothPermissions(): Promise<boolean> {
	if (Platform.OS !== 'android') {
		// iOS: permissions are handled by the system
		return true;
	}

	let permissionsToRequest: Permission[] = [];
	if (Platform.Version >= 31) { // Android 12+
		permissionsToRequest = [
			PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
			PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
		];
	} else {
		permissionsToRequest = [
			PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
		];
	}

	for (const perm of permissionsToRequest) {
		const result = await check(perm);
		if (result !== RESULTS.GRANTED) {
			const reqResult = await request(perm);
			if (reqResult !== RESULTS.GRANTED) {
				console.warn(`Permission not granted: ${perm}`);
				return false;
			}
		}
	}
	return true;
}
