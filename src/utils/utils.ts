import * as crypto from 'crypto';
export function otpCode() {
  const otp = crypto.randomInt(1000, 9999);
  return otp;
}

export function hashObjects(obj: Record<string, any> | Record<string, any>[]) {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(obj));
  return hash.digest('hex');
}

export function res(
  data: Record<string, any> | Record<string, any>[],
  message?: string,
  code?: number,
) {
  return {
    status: 'success',
    code: code || 200,
    message: message || '',
    data,
  };
}
