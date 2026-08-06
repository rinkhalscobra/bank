import { useEffect, useRef } from 'react';
import QRCodeGenerator from 'qrcode';

interface QRCodeProps {
  data: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
  className?: string;
}

export default function QRCode({
  data,
  size = 200,
  fgColor = '#0f172a',
  bgColor = '#ffffff',
  className = '',
}: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!data.trim()) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
      }
      return;
    }

    void QRCodeGenerator.toCanvas(canvas, data, {
      width: size,
      margin: 4,
      errorCorrectionLevel: 'M',
      color: {
        dark: fgColor,
        light: bgColor,
      },
    }).catch(() => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('QR Error', size / 2, size / 2);
    });
  }, [data, size, fgColor, bgColor]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label="Scannable wallet payment QR code"
    />
  );
}
