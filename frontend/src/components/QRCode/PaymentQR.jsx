export default function PaymentQR({ qrDataUrl, upiUrl }) {
  if (!qrDataUrl) return null;
  return (
    <div className="panel rounded-lg p-4">
      <img src={qrDataUrl} alt="UPI payment QR" className="mx-auto h-56 w-56 rounded-md border border-stone-200" />
      <a className="btn btn-secondary mt-4 w-full" href={upiUrl}>
        Open UPI App
      </a>
    </div>
  );
}
