import { useState, useRef, useCallback } from "react";
import { Upload, Camera, X, FileImage, FileText, Image, Video, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AttachmentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
}

interface AttachmentsCardProps {
  className?: string;
}

export function AttachmentsCard({ className }: AttachmentsCardProps) {
  const [files, setFiles] = useState<AttachmentFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processFiles = useCallback((fileList: FileList) => {
    const newFiles: AttachmentFile[] = [];
    
    Array.from(fileList).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max 10MB.`);
        return;
      }

      const attachment: AttachmentFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
      };

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFiles((prev) =>
            prev.map((f) => (f.id === attachment.id ? { ...f, preview: e.target?.result as string } : f))
          );
        };
        reader.readAsDataURL(file);
      }

      newFiles.push(attachment);
    });

    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return Image;
    if (type === "application/pdf") return FileText;
    return FileImage;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Open camera using getUserMedia API
  const openCamera = async () => {
    try {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Fallback to file input with camera capture
        fileInputRef.current?.click();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }, // Prefer back camera
        audio: false,
      });

      setCameraStream(stream);
      setIsCameraOpen(true);

      // Wait for video element to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (error) {
      console.error("Camera access error:", error);
      // Fallback to file input
      fileInputRef.current?.click();
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (!blob) return;

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const fileName = `photo-${timestamp}.jpg`;

      const attachment: AttachmentFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: fileName,
        type: "image/jpeg",
        size: blob.size,
        preview: canvas.toDataURL("image/jpeg", 0.9),
      };

      setFiles((prev) => [...prev, attachment]);
      closeCamera();
    }, "image/jpeg", 0.9);
  };

  return (
    <Card className={cn("border-border/50 shadow-md rounded-2xl", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Upload className="h-5 w-5 text-primary" />
          Attachments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Camera View */}
        {isCameraOpen && (
          <div className="relative rounded-xl overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="rounded-full h-12 w-12"
                onClick={closeCamera}
              >
                <StopCircle className="h-6 w-6" />
              </Button>
              <Button
                type="button"
                size="icon"
                className="rounded-full h-14 w-14 bg-white hover:bg-gray-100"
                onClick={capturePhoto}
              >
                <div className="h-10 w-10 rounded-full border-4 border-primary" />
              </Button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        {/* Drop Zone */}
        {!isCameraOpen && (
          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer",
              isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-1">
              Drag & drop files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Injury photos, ID documents, vitals monitor, prescriptions
            </p>
            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG (max 10MB)</p>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Camera Button */}
        {!isCameraOpen && (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={openCamera}
          >
            <Camera className="h-4 w-4 mr-2" />
            Take Photo
          </Button>
        )}

        {/* File Previews */}
        {files.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {files.map((file) => {
              const Icon = getFileIcon(file.type);
              return (
                <div
                  key={file.id}
                  className="relative group bg-muted/50 rounded-lg p-2 border border-border"
                >
                  <button
                    type="button"
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                  
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-20 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-20 flex items-center justify-center bg-muted rounded">
                      <Icon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  
                  <p className="text-xs truncate mt-1 text-muted-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
