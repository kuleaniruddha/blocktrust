export const money = (value, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: currency === "INR" ? 0 : 4 }).format(Number(value || 0));

export const shortHash = (hash = "") => (hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : "Pending");
