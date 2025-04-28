import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import CryptoJS from "crypto-js";
import { NextRequest, NextResponse } from "next/server";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function encrypt(message: string) {
  const encrypted = CryptoJS.AES.encrypt(
    message,
    CryptoJS.SHA256(process.env.NEXT_SECRET_KEY),
    {
      iv: CryptoJS.enc.Hex.parse(process.env.NEXT_SECRET_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  ).ciphertext.toString(CryptoJS.enc.Base64);
  const safeEncrypted = encrypted.replace(/\+/g, "_").replace(/=/g, "");
  return safeEncrypted;
}

export function decrypt(encrypted: string) {
  const safeEncrypted = encrypted.replace(/_/g, "+").replace(/-/g, "=");
  const decrypted = CryptoJS.AES.decrypt(
    encrypted,
    CryptoJS.SHA256(process.env.NEXT_SECRET_KEY),
    {
      iv: CryptoJS.enc.Hex.parse(process.env.NEXT_SECRET_IV),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  );

  const decryptedMessage = decrypted.toString(CryptoJS.enc.Utf8);

  return decryptedMessage;
}

export function setIpCookieIfChanged(
  realIp: string,
  request: NextRequest,
  response: NextResponse<unknown>
) {
  const enc_ip = encrypt(realIp);
  const cookieIp = request.cookies.get("user")?.value;
  const enc_c_ip = encrypt(cookieIp);

  if (realIp) {
    if (!cookieIp) {
      response.cookies.set("user", enc_ip, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
    } else if (enc_c_ip !== enc_ip) {
      response.cookies.set("user", enc_ip, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
      });
    } else {
      console.log("IP aynı, cookie güncellenmedi");
    }
  } else {
    console.log("Gerçek IP belirlenemedi");
  }
}
