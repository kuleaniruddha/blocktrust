import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import TransactionTable from "../../components/Tables/TransactionTable";

export default function Transactions() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [hash, setHash] = useState("");

  const load = () => {
    const endpoint = user?.role === "admin"
      ? `/donations${hash ? `?hash=${hash}` : ""}`
      : "/donations/my";
    api.get(endpoint).then((res) => setRows(res.data));
  };

  useEffect(() => {
    if (user) {
      load();
    }
  }, [user]);
  return (
    <div className="grid gap-4">
      <div className="panel flex flex-col gap-3 rounded-lg p-4 md:flex-row">
        <input className="input" placeholder="Search transaction hash" value={hash} onChange={(event) => setHash(event.target.value)} />
        <button className="btn btn-primary" onClick={load}>
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>
      <TransactionTable rows={rows} />
    </div>
  );
}
