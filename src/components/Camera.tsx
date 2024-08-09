import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';

interface CameraProps {
  onCapture: (imageSrc: string) => void;
}

export interface CameraHandle {
  captureImage: () => void;
}

const Camera = forwardRef<CameraHandle, CameraProps>(({ onCapture }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    const setupCamera = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsStreaming(true);
          }
        } catch (err) {
          console.error("Error accessing the camera: ", err);
        }
      }
    };

    setupCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageSrc = canvasRef.current.toDataURL('image/jpeg');
        onCapture(imageSrc);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    captureImage
  }));

  return (
    <div className="camera-component">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        style={{ width: '100%', maxWidth: '640px', display: isStreaming ? 'block' : 'none' }}
      />
      {!isStreaming && <div className="camera-placeholder">Loading camera...</div>}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
});

export default Camera;