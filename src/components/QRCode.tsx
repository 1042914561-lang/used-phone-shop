import { useEffect, useRef, useState } from "react";
import QRCodeLib from "qrcode";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

// 纯前端生成 QR 码(不依赖任何外部 API,国内访问无障碍)
export function QRCode({ value, size = 200, className = "" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;
    setErr(false);
    QRCodeLib.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
      errorCorrectionLevel: "M",
      color: {
        dark: "#18181b",
        light: "#ffffff",
      },
    }).catch((e) => {
      console.error("[QRCode] 生成失败", e);
      setErr(true);
    });
  }, [value, size]);

  if (err) {
    return (
      <div
        className={`bg-white rounded-lg p-2 inline-flex items-center justify-center text-zinc-500 text-xs ${className}`}
        style={{ width: size + 16, height: size + 16 }}
      >
        二维码生成失败
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg p-2 inline-block ${className}`}
      style={{ width: size + 16, height: size + 16 }}
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ display: "block" }}
      />
    </div>
  );
}
