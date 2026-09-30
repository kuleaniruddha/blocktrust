import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const SEPOLIA_RPC_URLS = [
  "https://ethereum-sepolia-rpc.publicnode.com",
  "https://rpc.sepolia.org",
  "https://rpc2.sepolia.org"
];

export function useWallet() {
  const [account, setAccount] = useState("");
  const [network, setNetwork] = useState("");
  const [chainId, setChainId] = useState("");
  const [balance, setBalance] = useState("0");
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [error, setError] = useState("");

  const fetchBalance = useCallback(async (targetAccount, customProvider) => {
    if (!targetAccount) {
      setBalance("0");
      return "0";
    }
    try {
      setLoadingBalance(true);
      let rawBalance = null;

      // 1. Try passing browser provider first
      if (customProvider) {
        try {
          rawBalance = await customProvider.getBalance(targetAccount);
        } catch (e) {
          console.warn("Browser provider balance fetch error, trying RPC fallback...", e);
        }
      }

      // 2. Try window.ethereum directly if customProvider was not passed or failed
      if (rawBalance === null && window.ethereum) {
        try {
          const bp = new ethers.BrowserProvider(window.ethereum);
          rawBalance = await bp.getBalance(targetAccount);
        } catch (e) {
          console.warn("window.ethereum balance fetch error, trying RPC fallback...", e);
        }
      }

      // 3. Fallback to public Sepolia RPCs if balance is still null
      if (rawBalance === null) {
        for (const rpcUrl of SEPOLIA_RPC_URLS) {
          try {
            const rpcProvider = new ethers.JsonRpcProvider(rpcUrl);
            rawBalance = await rpcProvider.getBalance(targetAccount);
            if (rawBalance !== null) break;
          } catch (rpcErr) {
            console.warn(`RPC ${rpcUrl} balance fetch failed:`, rpcErr);
          }
        }
      }

      if (rawBalance !== null) {
        const formatted = ethers.formatEther(rawBalance);
        const numVal = parseFloat(formatted);
        const displayVal = isNaN(numVal) ? "0" : numVal.toFixed(4);
        setBalance(displayVal);
        return displayVal;
      } else {
        setBalance("0");
        return "0";
      }
    } catch (err) {
      console.error("Error fetching balance:", err);
      setBalance("0");
      return "0";
    } finally {
      setLoadingBalance(false);
    }
  }, []);

  const connect = useCallback(async () => {
    setError("");
    if (!window.ethereum) {
      const message = "MetaMask is not installed or this browser does not expose window.ethereum.";
      setError(message);
      throw new Error(message);
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      if (!accounts.length) throw new Error("No wallet account was returned by MetaMask.");
      const net = await provider.getNetwork();
      const currentAcc = accounts[0];
      setAccount(currentAcc);
      setChainId(String(net.chainId));
      setNetwork(net.name === "unknown" || net.name === "sepolia" ? "Sepolia Testnet" : net.name);
      
      await fetchBalance(currentAcc, provider);
      return { provider, account: currentAcc };
    } catch (err) {
      const message = err?.code === 4001 ? "MetaMask connection was rejected." : err.message || "MetaMask connection failed.";
      setError(message);
      throw new Error(message);
    }
  }, [fetchBalance]);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) return;
    try {
      setError("");
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }] // 11155111 in hex is 0xaa36a7
      });
      await connect();
    } catch (err) {
      if (err.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0xaa36a7",
              chainName: "Sepolia Test Network",
              nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
              rpcUrls: ["https://rpc.sepolia.org", "https://ethereum-sepolia-rpc.publicnode.com"],
              blockExplorerUrls: ["https://sepolia.etherscan.io"]
            }]
          });
          await connect();
        } catch (addErr) {
          setError(addErr.message || "Failed to add Sepolia network.");
        }
      } else {
        setError(err.message || "Failed to switch network.");
      }
    }
  }, [connect]);

  useEffect(() => {
    if (!window.ethereum) return;

    window.ethereum.request({ method: "eth_accounts" })
      .then(async (accounts) => {
        if (accounts && accounts.length > 0) {
          setAccount(accounts[0]);
          const bp = new ethers.BrowserProvider(window.ethereum);
          const net = await bp.getNetwork();
          setChainId(String(net.chainId));
          setNetwork(net.name === "unknown" || net.name === "sepolia" ? "Sepolia Testnet" : net.name);
          fetchBalance(accounts[0], bp);
        }
      })
      .catch(console.error);

    const handleAccountsChanged = async (accounts) => {
      if (accounts && accounts.length > 0) {
        const newAcc = accounts[0];
        setAccount(newAcc);
        if (window.ethereum) {
          const bp = new ethers.BrowserProvider(window.ethereum);
          fetchBalance(newAcc, bp);
        }
      } else {
        setAccount("");
        setBalance("0");
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (window.ethereum.on) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);
    }

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [fetchBalance]);

  async function sendEthDonation({ amountEth }) {
    const { provider } = await connect();
    const signer = await provider.getSigner();
    const to = "0xcb1d95c1962513a59811804a1db8559263050ec7"; // Locked official Ram Mandir Trust address
    
    if (!to || !ethers.isAddress(to)) {
      throw new Error("Invalid destination wallet address. Please provide a valid Ethereum wallet address.");
    }
    if (!amountEth || isNaN(amountEth) || Number(amountEth) <= 0) {
      throw new Error("Please enter a valid ETH amount greater than 0.");
    }

    const txPayload = {
      to,
      value: ethers.parseEther(String(amountEth))
    };

    try {
      const tx = await signer.sendTransaction(txPayload);
      setTimeout(() => fetchBalance(account, provider), 2000);
      return tx;
    } catch (err) {
      const currentBal = await fetchBalance(account, provider);
      if (err.code === "INSUFFICIENT_FUNDS" || err?.message?.includes("insufficient funds")) {
        throw new Error(`Insufficient ETH in your MetaMask wallet (${account || "connected wallet"} has ${currentBal} ETH balance). Please add Sepolia testnet ETH or use Test Mode below to verify.`);
      }
      if (err.code === 4001 || err?.message?.includes("user rejected")) {
        throw new Error("MetaMask transaction was rejected by user.");
      }
      throw new Error(err.shortMessage || err.message || "MetaMask transaction failed.");
    }
  }

  return { account, network, chainId, balance, loadingBalance, error, connect, switchNetwork, fetchBalance, sendEthDonation };
}

