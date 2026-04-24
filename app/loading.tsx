import Image from "next/image";

export default function Loading() {
  return (
    <div style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "rgba(253, 250, 244, 0.8)", // var(--color-ivory) with opacity
      backdropFilter: "blur(4px)",
      zIndex: 9999,
    }}>
      <Image
        src="/loading.gif"
        alt="Loading..."
        width={80}
        height={80}
        unoptimized
        style={{ objectFit: "contain" }}
        priority
      />
    </div>
  );
}
