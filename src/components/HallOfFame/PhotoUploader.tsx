import { useRef } from "react";
import { MagneticButton } from "../space/MagneticButton";

export function PhotoUploader({ onFile }: { onFile: (file: File) => void }) {
  const uploadRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
    e.target.value = "";
  };

  return (
    <div className="flex flex-wrap gap-3">
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={pick}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        onChange={pick}
      />
      <MagneticButton
        onClick={() => uploadRef.current?.click()}
        variant="primary"
        className="text-xs h-10 px-5 min-h-[40px]"
      >
        Upload photo
      </MagneticButton>
      <MagneticButton
        onClick={() => cameraRef.current?.click()}
        variant="ghost"
        className="text-xs h-10 px-5 min-h-[40px]"
      >
        Use camera
      </MagneticButton>
    </div>
  );
}