import Image from "next/image";

export default function Loading() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minHeight: "60vh",
      width: "100%",
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
