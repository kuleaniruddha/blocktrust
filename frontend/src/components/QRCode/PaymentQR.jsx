import { QrCode, Smartphone, CheckCircle, ExternalLink } from "lucide-react";

export default function PaymentQR({ qrDataUrl, upiUrl }) {
  if (!qrDataUrl) return null;

  return (
    <div className="panel rounded-3xl p-6 bg-white border border-stone-200/90 shadow-card text-center space-y-4">
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <QrCode className="h-3.5 w-3.5" />
        <span>Instant UPI Payment Intent</span>
      </div>

      <div className="relative mx-auto w-fit p-3 bg-white rounded-2xl border-2 border-amber-300 shadow-glow">
        <img
          src={qrDataUrl}
          alt="UPI payment QR Code"
          className="h-56 w-56 rounded-xl object-contain mx-auto"
        />
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
          Scan & Pay
        </div>
      </div>

      <div className="space-y-1.5 pt-1">
        <p className="text-xs font-black text-stone-800">Supported UPI Applications</p>
        <p className="text-[11px] text-stone-500">Google Pay · PhonePe · Paytm · BHIM · Any Banking App</p>
      </div>

      {upiUrl && (
        <a
          className="btn btn-primary w-full text-xs font-bold py-2.5 shadow-sm flex items-center justify-center gap-2"
          href={upiUrl}
          target="_blank"
          rel="noreferrer"
        >
          <Smartphone className="h-4 w-4" />
          Open Directly in UPI App
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      )}

      <div className="text-[11px] text-stone-400 font-medium">
        After paying, your contribution is logged and an instant receipt is issued.
      </div>
    </div>
  );
}
