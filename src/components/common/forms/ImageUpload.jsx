import { useEffect, useId, useRef, useState } from "react";
import { LuImage, LuTrash2, LuUpload } from "react-icons/lu";
import { IMAGE_TYPES, MAX_IMAGE_SIZE } from "../../../constants/product";

// Click-or-drop image picker with a preview.
//   file:        the newly picked File (or null)
//   existingUrl: the saved image to show while no new file is picked
//   onChange(file) / onRemove(): the parent keeps the state
const ImageUpload = ({ label, file, existingUrl, onChange, onRemove, error }) => {
  const id = useId();
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [localError, setLocalError] = useState("");
  const [fileUrl, setFileUrl] = useState(null);

  // Preview URL for a picked file, released when it changes
  useEffect(() => {
    if (!file) return setFileUrl(null);
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const previewUrl = fileUrl || existingUrl;

  const pick = (picked) => {
    if (!picked) return;
    if (!IMAGE_TYPES.includes(picked.type)) return setLocalError("Only PNG, JPG, GIF or WEBP images are allowed.");
    if (picked.size > MAX_IMAGE_SIZE) return setLocalError("Image must be 10MB or smaller.");
    setLocalError("");
    onChange(picked);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files?.[0]);
  };

  const shownError = localError || error;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
          {label}
        </label>
      )}

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        className="sr-only"
        onChange={(e) => {
          pick(e.target.files?.[0]);
          e.target.value = ""; // picking the same file again still fires onChange
        }}
      />

      {previewUrl ? (
        <div className="flex items-center gap-4 rounded-lg border border-slate-200 p-3">
          <img src={previewUrl} alt="" className="h-24 w-24 rounded-md object-cover ring-1 ring-slate-200" />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LuImage className="h-4 w-4" aria-hidden="true" />
              Change
            </button>
            <button
              type="button"
              onClick={() => {
                setLocalError("");
                onRemove();
              }}
              className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LuTrash2 className="h-4 w-4" aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-10 text-center transition-colors ${
            dragging ? "border-indigo-400 bg-indigo-50" : "border-slate-300 hover:border-slate-400 hover:bg-slate-50"
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <LuUpload className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="mt-3 text-sm font-medium text-slate-700">Click to upload or drag and drop</span>
          <span className="mt-1 text-xs text-slate-500">PNG, JPG, GIF up to 10MB</span>
        </button>
      )}

      {shownError && <p className="mt-1 text-sm text-red-600">{shownError}</p>}
    </div>
  );
};

export default ImageUpload;
