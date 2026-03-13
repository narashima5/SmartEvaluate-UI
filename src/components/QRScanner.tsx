import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanFailure?: (error: any) => void;
}

const QRScanner = ({ onScanSuccess, onScanFailure }: QRScannerProps) => {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);

    useEffect(() => {
        // Run after component paints
        const timer = setTimeout(() => {
            if (!document.getElementById("qr-reader")) return;

            // Html5QrcodeScanner provides a more robust UI and camera initialization 
            // process that works better across browsers for high-res/dense QR codes.
            const scanner = new Html5QrcodeScanner(
                "qr-reader",
                {
                    fps: 10,
                    // Leaving qrbox undefined allows the scanner to utilize the maximum possible resolution
                    // which is structurally necessary for the dense JSON payloads this application uses.
                    rememberLastUsedCamera: true,
                    videoConstraints: {
                        width: { min: 640, ideal: 1280, max: 1920 },
                        height: { min: 480, ideal: 720, max: 1080 },
                        facingMode: "environment"
                    }
                },
                /* verbose= */ false
            );

            scannerRef.current = scanner;

            scanner.render(
                (decodedText) => {
                    // Success callback
                    onScanSuccess(decodedText);
                },
                (errorMessage: any) => {
                    // Failure callback
                    const errMsg = typeof errorMessage === 'string' ? errorMessage : (errorMessage?.message || String(errorMessage));
                    if (onScanFailure && typeof errMsg === 'string' && !errMsg.includes("NotFoundException")) {
                        onScanFailure(errMsg);
                    }
                }
            );
        }, 100);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                try {
                    scannerRef.current.clear();
                } catch (e) {
                    console.error("Failed to clear html5qrcodescanner", e);
                }
            }
        };
    }, [onScanSuccess, onScanFailure]);

    return (
        <div className="w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black/50 relative">
            <div id="qr-reader" className="w-full min-h-[300px]"></div>
            <style>{`
                /* Override default Html5QrcodeScanner styles to fit dark mode better */
                #qr-reader { border: none !important; }
                #qr-reader img { display: none !important; }
                #qr-reader__dashboard_section_csr button { 
                    background: #4f46e5 !important; 
                    color: white !important; 
                    border: none !important; 
                    border-radius: 8px !important;
                    padding: 8px 16px !important;
                    margin-top: 10px !important;
                }
                #qr-reader__dashboard_section_swaplink { color: #818cf8 !important; }
                #qr-reader__scan_region { background: black !important; }
            `}</style>
        </div>
    );
};

export default QRScanner;
