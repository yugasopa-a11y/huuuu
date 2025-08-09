import { useRef, useEffect } from "react";
import { Box } from "lucide-react";

interface ModelViewerProps {
  file?: File;
  className?: string;
}

export default function ModelViewer({ file, className = "" }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (file && containerRef.current) {
      // TODO: Implement Three.js 3D model viewer
      // This would load and display STL, OBJ, or 3MF files
      console.log("Loading 3D model:", file.name);
    }
  }, [file]);

  if (!file) {
    return (
      <div className={`aspect-square bg-dark-accent rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Box className="h-12 w-12 text-text-secondary mb-2 mx-auto" />
          <p className="text-text-secondary">Upload a 3D model to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`aspect-square bg-dark-accent rounded-lg flex items-center justify-center model-viewer ${className}`}
    >
      <div className="text-center">
        <Box className="h-12 w-12 text-cyan-primary mb-2 mx-auto animate-spin" />
        <p className="text-cyan-primary font-medium">{file.name}</p>
        <p className="text-text-secondary text-sm mt-1">3D Model Preview</p>
      </div>
    </div>
  );
}
