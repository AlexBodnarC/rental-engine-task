import React from "react";

export default function Container({
  children,
  minWidth = "10rem",
  minHeight = "10rem",
}: {
  children: React.ReactNode;
  minWidth?: string;
  minHeight?: string;
}) {
  return (
    <div
      style={{ minWidth: minWidth, minHeight: minHeight }}
      className="flex rounded-lg bg-white p-3"
    >
      {children}
    </div>
  );
}
