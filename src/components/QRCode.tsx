import { useState } from "react";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

// 免依赖的 QR 码组件,调用公开 API(api.qrserver.com)
export function QRCode({ value, size = 200, className = "" }: QRCodeProps) {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(false);
  const url = err
    ? ""
    : `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(
        value
      )}&margin=10&bgcolor=ffffff&color=18181b`;
  return (
    <div
      className={`relative bg-white rounded-lg p-2 inline-block ${className}`}
      style={{ width: size + 16, height: size + 16 }}
    >
      {err ? (
        <div
          className="flex items-center justify-center text-zinc-500 text-xs"
          style={{ width: size, height: size }}
        >
          二维码生成失败
        </div>
      ) : (
        <>
          {loading && (
            <div
              className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs"
              style={{ width: size + 16, height: size + 16 }}
            >
              生成中...
            </div>
          )}
          <img
            src={url}
            alt={value}
            width={size}
            height={size}
            className={loading ? "opacity-0" : "opacity-100 transition-opacity"}
            onLoad={() => setLoading(false)}
            onError={() => setErr(true)}
          />
        </>
      )}
    </div>
  );
}
