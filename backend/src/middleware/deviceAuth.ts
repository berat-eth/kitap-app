import { Response, NextFunction } from 'express';
import { DeviceRequest, ApiResponse } from '../types';
import { AppDataSource } from '../config/database';
import { Device } from '../entities/Device';

/**
 * Device ID kontrolü ve doğrulama
 * Header: X-Device-ID
 */
export const deviceAuth = async (
  req: DeviceRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const deviceId = req.headers['x-device-id'] as string;

  if (!deviceId) {
    const response: ApiResponse = {
      success: false,
      error: 'Device ID gerekli (X-Device-ID header)',
    };
    res.status(401).json(response);
    return;
  }

  try {
    const deviceRepository = AppDataSource.getRepository(Device);
    let device = await deviceRepository.findOne({
      where: { deviceId },
    });

    if (!device) {
      const response: ApiResponse = {
        success: false,
        error: 'Geçersiz Device ID. Önce /api/device/register ile kayıt olun.',
      };
      res.status(401).json(response);
      return;
    }

    // Son görülme zamanını güncelle
    device.lastSeen = new Date();
    await deviceRepository.save(device);

    req.device = device;
    req.deviceId = deviceId;
    next();
  } catch (error) {
    console.error('Device auth hatası:', error);
    const response: ApiResponse = {
      success: false,
      error: 'Cihaz doğrulama hatası',
    };
    res.status(500).json(response);
  }
};

/**
 * Opsiyonel Device ID kontrolü
 * Device ID varsa doğrular, yoksa devam eder
 */
export const optionalDeviceAuth = async (
  req: DeviceRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const deviceId = req.headers['x-device-id'] as string;

  if (!deviceId) {
    next();
    return;
  }

  try {
    const deviceRepository = AppDataSource.getRepository(Device);
    const device = await deviceRepository.findOne({
      where: { deviceId },
    });

    if (device) {
      device.lastSeen = new Date();
      await deviceRepository.save(device);
      req.device = device;
      req.deviceId = deviceId;
    }

    next();
  } catch (error) {
    console.error('Optional device auth hatası:', error);
    next();
  }
};
