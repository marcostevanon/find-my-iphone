import axios, { AxiosInstance } from 'axios';

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

export class FindMyPhone {
  private appleId: string;
  private password: string;
  private client: AxiosInstance;
  private basePath: string | null = null;

  constructor(appleId: string, password: string) {
    this.appleId = appleId;
    this.password = password;
    this.client = axios.create({
      headers: { 'Origin': 'https://www.icloud.com' },
      withCredentials: true,
    });
  }

  async login(): Promise<void> {
    const res = await this.client.post('https://setup.icloud.com/setup/ws/1/login', {
      apple_id: this.appleId,
      password: this.password,
      extended_login: true,
    });
    if (!res.data.webservices?.findme?.url) throw new Error('Login failed');
    this.basePath = res.data.webservices.findme.url;
  }

  async getDevices(): Promise<Device[]> {
    if (!this.basePath) await this.login();
    const res = await this.client.post(`${this.basePath}/fmipservice/client/web/initClient`, {
      clientContext: {
        appName: 'iCloud Find (Web)',
        appVersion: '2.0',
        timezone: 'US/Eastern',
        inactiveTime: 3571,
        apiVersion: '3.0',
        fmly: false,
      }
    });
    return res.data.content as Device[];
  }

  async alertDevice(deviceId: string): Promise<void> {
    if (!this.basePath) await this.login();
    await this.client.post(`${this.basePath}/fmipservice/client/web/playSound`, {
      subject: 'Find My iPhone Alert',
      device: deviceId,
    });
  }

  async getLocationOfDevice(device: Device): Promise<string> {
    if (!device.location) throw new Error('No location in device');
    const { latitude, longitude } = device.location;
    const res = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&sensor=true`
    );
    if (res.data.results?.[0]?.formatted_address) {
      return res.data.results[0].formatted_address;
    }
    throw new Error('No address found');
  }

  async getDistanceOfDevice(device: Device, myLatitude: number, myLongitude: number): Promise<any> {
    if (!device.location) throw new Error('No location in device');
    const { latitude, longitude } = device.location;
    const res = await axios.get(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${myLatitude},${myLongitude}&destinations=${latitude},${longitude}&mode=driving&sensor=false`
    );
    return res.data.rows?.[0]?.elements?.[0];
  }
}