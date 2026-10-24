import React, { useRef } from 'react';
import { useNovaStore } from '../../store/useNovaStore';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer, ExternalLink, QrCode, Sparkles, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const QrCodePage: React.FC = () => {
  const { settings } = useNovaStore();
  const checkinUrl = `${window.location.origin}/checkin/${settings.shopId}`;
  const qrRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    canvas.width = 600;
    canvas.height = 600;

    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 50, 50, 500, 500);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `${settings.shopId}-counter-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-4xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#0B0B0C] tracking-tight">
            Counter check-in QR code
          </h1>
          <p className="text-sm text-[#6E6E73] mt-0.5">
            Display this QR at your checkout counter. Patrons scan with any phone camera to check in.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white px-3.5 py-1.5 rounded-full border border-black/[0.08] shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
          <span>Zero app download needed for patrons</span>
        </div>
      </div>

      {/* Main QR Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        
        {/* Printable Card Area */}
        <div className="md:col-span-7 bg-white rounded-[32px] border border-black/[0.08] p-8 sm:p-10 shadow-[0_12px_36px_rgba(0,0,0,0.04)] text-center flex flex-col items-center">
          
          <div className="w-12 h-12 rounded-[16px] bg-[#2F6BFF]/10 text-[#2F6BFF] flex items-center justify-center mb-4">
            <QrCode className="w-6 h-6" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73] mb-1">
            Scan to check in & earn rewards
          </span>
          <h2 className="text-2xl font-bold text-[#0B0B0C] mb-6 tracking-tight">
            {settings.shopName}
          </h2>

          {/* QR Code Container */}
          <div
            ref={qrRef}
            className="p-6 rounded-[24px] bg-[#F9F9FA] border border-black/[0.06] shadow-inner mb-6 flex items-center justify-center"
          >
            <QRCodeSVG
              value={checkinUrl}
              size={240}
              level="H"
              includeMargin={false}
              fgColor="#0B0B0C"
              bgColor="#F9F9FA"
            />
          </div>

          <div className="text-xs text-[#6E6E73] max-w-xs mb-6">
            Point smartphone camera &bull; Enter mobile or email &bull; Instant points
          </div>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={handleDownload}
              className="flex-1 h-11 rounded-[12px] bg-[#2F6BFF] hover:bg-[#1F58E6] text-white text-xs font-medium transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 h-11 rounded-[12px] bg-white border border-black/[0.12] hover:bg-[#F9F9FA] text-[#0B0B0C] text-xs font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print standee</span>
            </button>
          </div>
        </div>

        {/* Counter Tip & Test Link (md:col-span-5) */}
        <div className="md:col-span-5 space-y-5">
          
          <div className="rounded-[24px] bg-[#FFE96B]/30 border border-[#FFE96B] p-6 text-xs text-[#3B3200]">
            <div className="flex items-center gap-2 font-semibold text-sm mb-2 text-[#3B3200]">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              <span>Counter placement best practice</span>
            </div>
            <p className="leading-relaxed">
              Print this code on acrylic counter stands or print receipts. Cashiers can ask:
              <i> "Scan here for 10% off your next cup or to collect stamps!"</i>
            </p>
          </div>

          <div className="rounded-[24px] bg-white border border-black/[0.08] p-6 shadow-xs space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#6E6E73]">
              Direct web check-in link
            </div>
            <div className="p-3 rounded-[12px] bg-[#F6F6F7] text-xs font-mono text-[#0B0B0C] break-all border border-black/[0.04]">
              {checkinUrl}
            </div>

            <Link
              to={`/checkin/${settings.shopId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold text-[#2F6BFF] hover:underline pt-1"
            >
              <span>Test customer check-in screen in new tab</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-5 rounded-[22px] bg-[#F1F1F2] border border-black/[0.06] text-xs text-[#6E6E73] space-y-1">
            <span className="font-semibold text-[#0B0B0C] block">Privacy guarantee</span>
            <p>
              Patrons choose their channel and consent level directly on their own device.
              No paper logs, zero visible contact numbers on the counter.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
