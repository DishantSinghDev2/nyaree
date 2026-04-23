const fs = require('fs');

const path = 'app/(store)/checkout/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// Add import for useSession
code = code.replace(
  'import { useCartStore } from "@/lib/store/cart";',
  'import { useSession } from "next-auth/react";\nimport { useCartStore } from "@/lib/store/cart";'
);

// Add state for savedAddresses, selectedAddressId, saveAddress, nickname
const stateInsert = `
  const { data: session } = useSession();
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("new");
  const [saveNewAddress, setSaveNewAddress] = useState(false);
  const [addressNickname, setAddressNickname] = useState("");

  useEffect(() => {
    if (session?.user) {
      fetch("/api/account/addresses")
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data.length > 0) {
            setSavedAddresses(data.data);
          }
        });
    }
  }, [session]);

  const handleSelectAddress = (addrId: string) => {
    setSelectedAddressId(addrId);
    if (addrId !== "new") {
      const addr = savedAddresses.find((a: any) => a._id === addrId);
      if (addr) {
        setAddress({
          fullName: addr.fullName || "",
          phone: addr.phone || "",
          email: session?.user?.email || address.email,
          addressLine1: addr.addressLine1 || "",
          addressLine2: addr.addressLine2 || "",
          city: addr.city || "",
          state: addr.state || "Haryana",
          pincode: addr.pincode || "",
          latitude: addr.latitude,
          longitude: addr.longitude,
        });
      }
    } else {
      setAddress({
        fullName: "", phone: "", email: session?.user?.email || address.email,
        addressLine1: "", addressLine2: "", city: "", state: "Haryana", pincode: "",
        latitude: undefined, longitude: undefined,
      });
    }
  };
`;

code = code.replace(
  'const [address, setAddress] = useState({',
  stateInsert + '\n  const [address, setAddress] = useState({'
);

// Inject saving address logic inside placeOrder
const placeOrderInsert = `
    if (saveNewAddress && selectedAddressId === "new" && session?.user) {
      try {
        await fetch("/api/account/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...address, nickname: addressNickname || "My Address" })
        });
      } catch (e) {}
    }
`;
code = code.replace(
  'setLoading(true);',
  placeOrderInsert + '\n    setLoading(true);'
);

// Inject UI for selecting addresses
const uiInsert = `
            {savedAddresses.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <label className="label">Select Saved Address</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {savedAddresses.map((addr: any) => (
                    <label key={addr._id} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, border: \`1px solid \${selectedAddressId === addr._id ? 'var(--color-gold)' : 'var(--color-border)'}\`, borderRadius: 'var(--radius-sm)', cursor: "pointer", background: selectedAddressId === addr._id ? "#FEF9EC" : "transparent" }}>
                      <input type="radio" name="savedAddress" checked={selectedAddressId === addr._id} onChange={() => handleSelectAddress(addr._id)} style={{ marginTop: 2 }} />
                      <div>
                        <p style={{ fontWeight: 500, fontSize: 14 }}>{addr.nickname ? \`\${addr.nickname} (\${addr.fullName})\` : addr.fullName}</p>
                        <p style={{ fontSize: 12, color: "var(--color-ink-light)" }}>{addr.addressLine1}, {addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    </label>
                  ))}
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, border: \`1px solid \${selectedAddressId === 'new' ? 'var(--color-gold)' : 'var(--color-border)'}\`, borderRadius: 'var(--radius-sm)', cursor: "pointer", background: selectedAddressId === 'new' ? "#FEF9EC" : "transparent" }}>
                    <input type="radio" name="savedAddress" checked={selectedAddressId === 'new'} onChange={() => handleSelectAddress('new')} style={{ marginTop: 2 }} />
                    <span style={{ fontWeight: 500, fontSize: 14 }}>Add New Address</span>
                  </label>
                </div>
              </div>
            )}
`;

// Insert the UI before the map
code = code.replace(
  '<div style={{ marginBottom: 20 }}>\n              <MapPicker',
  uiInsert + '\n            <div style={{ marginBottom: 20 }}>\n              <MapPicker'
);

// Add the checkbox for saving new address
const saveUiInsert = `
            {selectedAddressId === "new" && session?.user && (
              <div style={{ marginTop: 16, padding: 16, background: "var(--color-ivory-dark)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14 }}>
                  <input type="checkbox" checked={saveNewAddress} onChange={(e) => setSaveNewAddress(e.target.checked)} />
                  Save this address for future use
                </label>
                {saveNewAddress && (
                  <div style={{ marginTop: 12 }}>
                    <label className="label">Address Nickname (e.g. Home, Office)</label>
                    <input className="input" value={addressNickname} onChange={(e) => setAddressNickname(e.target.value)} placeholder="Home" />
                  </div>
                )}
              </div>
            )}
`;

// Insert after the state dropdown
code = code.replace(
  '</select>\n              </div>\n            </div>',
  '</select>\n              </div>\n            </div>\n' + saveUiInsert
);

fs.writeFileSync(path, code);
console.log("Updated checkout page");
