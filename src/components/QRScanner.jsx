import {
    AlertCircle,
    Camera,
    CheckCircle,
    Download,
    Square,
    Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const QRScanner = () => {
    const [scannedTeams, setScannedTeams] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scanningActive, setScanningActive] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const scanIntervalRef = useRef(null);

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZ6cEK6JXqXGjVGFaWwSr4giCi0xdPF3Exrw-NqajvzA3_y0aMC0gp6HnqLlH4KAZB/exec";

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment",
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
            }
            setIsScanning(true);
            setError("");
        } catch (err) {
            console.log('Camera start error : ', err);
            setError("Camera access denied. Please enable camera permissions or use manual input.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
        }
        if (scanIntervalRef.current) {
            clearInterval(scanIntervalRef.current);
            scanIntervalRef.current = null;
        }
        setIsScanning(false);
        setScanningActive(false);
    };

    const detectQRCode = async () => {
        const video = videoRef.current;
        if (!video) return null;

        try {
            if ("BarcodeDetector" in window) {
                const detector = new window.BarcodeDetector({ formats: ["qr_code"] });
                const barcodes = await detector.detect(video);
                if (barcodes.length > 0) {
                    return barcodes[0].rawValue;
                }
            }
        } catch (error) {
            console.error("QR detection error:", error);
        }

        return null;
    };

    const startQRScanning = () => {
        if (!isScanning) return;

        setScanningActive(true);
        scanIntervalRef.current = setInterval(async () => {
            const qrCode = await detectQRCode();
            console.log('qrCode : ', qrCode);
            if (qrCode) {
                setScanningActive(false);
                clearInterval(scanIntervalRef.current);
                processScannedData(qrCode);
            }
        }, 500);
        console.log('scanIntervalRef.current : ', scanIntervalRef.current);
    };

    const sendToGoogleSheets = async (teamData) => {
        try {
            setIsSubmitting(true);
            await fetch(GOOGLE_SCRIPT_URL, {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(teamData),
            });
            return true;
        } catch (error) {
            console.error("Error sending to Google Sheets:", error);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    const processScannedData = async (qrData) => {
        const timestamp = new Date().toISOString();
        const teamExists = scannedTeams.some((team) => team.qrCode === qrData);
        if (teamExists) {
            setError(`Team already scanned!`);
            return;
        }

        // Parse the QR text into key-value pairs
        const lines = qrData.split("\n");
        const teamData = {
            Timestamp: timestamp,
            University: "",
            TeamName: "",
            BotName: "",
            TeamLeader: "",
            LeaderEmail: "",
            LeaderPhone: "",
            Member2: "",
            Member3: "",
        };

        lines.forEach((line) => {
            const [key, ...rest] = line.split(":");
            const value = rest.join(":").trim(); // Handle colons in values

            switch (key.trim().toLowerCase()) {
                case "university":
                    teamData.University = value;
                    break;
                case "name":
                case "team name":
                    teamData.TeamName = value;
                    break;
                case "bot name":
                    teamData.BotName = value;
                    break;
                case "team leader":
                    teamData.TeamLeader = value;
                    break;
                case "leader email":
                    teamData.LeaderEmail = value;
                    break;
                case "leader phone":
                    teamData.LeaderPhone = value;
                    break;
                case "member 2":
                    teamData.Member2 = value;
                    break;
                case "member 3":
                    teamData.Member3 = value;
                    break;
                default:
                    break;
            }
        });

        const success = await sendToGoogleSheets(teamData);

        if (success) {
            setScannedTeams((prev) => [...prev, { qrCode: qrData, timestamp }]);
            setScanResult(qrData);
            setError("");
        } else {
            setError(`Failed to send data to Google Sheets.`);
        }
    };

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div className="min-h-screen p-4 bg-white">
            <h1>Test</h1>
            <div className="max-w-xl mx-auto">
                <h1 className="mb-4 text-2xl font-bold text-center">QR Scanner</h1>
                {error && <div className="mb-2 text-red-600">{error}</div>}
                {scanResult && <div className="mb-2 text-green-600">Scanned: {scanResult}</div>}
                <div className="space-y-4">
                    {!isScanning ? (
                        <button onClick={startCamera} className="w-full p-3 text-white bg-blue-600 rounded">Start Camera</button>
                    ) : (
                        <>
                            <button onClick={startQRScanning} disabled={scanningActive} className="w-full p-3 text-white bg-green-600 rounded disabled:bg-gray-400">
                                {scanningActive ? "Scanning..." : "Scan QR Code"}
                            </button>
                            <button onClick={stopCamera} className="w-full p-3 text-white bg-red-600 rounded">Stop Camera</button>
                        </>
                    )}
                    <div className="overflow-hidden bg-black rounded">
                        <video ref={videoRef} autoPlay playsInline className="object-cover w-full h-64" />
                        <canvas ref={canvasRef} className="hidden" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
