export interface Device {
    id: string;
    name: string;
    deviceModel: string;
    modelDisplayName: string;
    deviceDisplayName: string;
    batteryLevel: number;
    isLocating: boolean;
    lostModeCapable: boolean;
    location?: {
        latitude: number;
        longitude: number;
        [key: string]: any;
    };
}
export declare class FindMyPhone {
    private appleId;
    private password;
    private client;
    private basePath;
    constructor(appleId: string, password: string);
    login(): Promise<void>;
    getDevices(): Promise<Device[]>;
    alertDevice(deviceId: string): Promise<void>;
    getLocationOfDevice(device: Device): Promise<string>;
    getDistanceOfDevice(device: Device, myLatitude: number, myLongitude: number): Promise<any>;
}
