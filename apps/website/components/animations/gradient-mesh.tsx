"use client";

type GradientMeshProps = {
  className?: string;
};

export function GradientMesh({ className }: GradientMeshProps) {
  return (
    <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className ?? ""}`}>
      <div className="mesh-blob mesh-blob-1" />
      <div className="mesh-blob mesh-blob-2" />
      <div className="mesh-blob mesh-blob-3" />
      <div className="mesh-blob mesh-blob-4" />
    </div>
  );
}
