import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';

// generate 2fa secret and return it with qr code
export async function generateTOTPSecret(username: string): Promise<{ secret: string; qrCode: string }> {
  // creates new totp secret for user
  const totp = new OTPAuth.TOTP({
    issuer: 'Transcendence',  // app name shown in authenticator
    label: username,  // user identifier in authenticator
    algorithm: 'SHA1',  // hash algo for totp
    digits: 6,  // 6 digit codes
    period: 30,  // code changes every 30 seconds
  });

  const secret = totp.secret.base32;  // gets secret in base32 format
  const otpauthURL = totp.toString();  // creates otpauth url for qr code

  // generates qr code image as data url
  const qrCode = await QRCode.toDataURL(otpauthURL);

  return { secret, qrCode };
}

// verify totp code is correct
export function verifyTOTPToken(secret: string, token: string): boolean {
  // creates totp object from stored secret
  const totp = new OTPAuth.TOTP({
    secret: OTPAuth.Secret.fromBase32(secret),  // converts base32 secret
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
  });

  // checks if token is valid (with 1 window tolerance for time drift)
  const delta = totp.validate({ token, window: 1 });

  return delta !== null;  // returns true if token matches
}
