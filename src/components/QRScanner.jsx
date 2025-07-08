import {
    AlertCircle,
    Camera,
    CheckCircle,
    Download,
    Square,
    Trash2,
    Zap,
    Shield,
    Target,
    Scan,
    Bot,
    Users,
    Phone,
    Mail,
    University,
    User,
    Clock,
    Play,
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

    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxb9sWGRv6C3hjZvNdbREMb-fwZI_cnLMtm3NdWqunToEIQ6BVwMEf02GM7CJ5FzHOy/exec";

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
        <div className="relative h-screen min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute w-2 h-2 rounded-full top-10 left-10 bg-cyan-400 animate-pulse"></div>
                <div className="absolute w-1 h-1 bg-blue-400 rounded-full top-32 right-16 animate-ping"></div>
                <div className="absolute w-3 h-3 bg-indigo-400 rounded-full bottom-40 left-20 animate-pulse"></div>
                <div className="absolute w-2 h-2 rounded-full bottom-20 right-10 bg-cyan-300 animate-ping"></div>
            </div>

            {/* Grid Pattern Overlay */}
            <div 
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `
                        linear-gradient(90deg, #00bcd4 1px, transparent 1px),
                        linear-gradient(180deg, #00bcd4 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                }}
            ></div>

            <div className="relative z-10 h-screen min-h-screen p-4 md:p-6">
                <div className="max-w-lg mx-auto">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="flex items-center justify-center mb-4">
                            <div className="relative">
                                <div className="flex items-center justify-center w-16 h-16 shadow-2xl bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl">
                                    <Bot className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute w-4 h-4 bg-red-500 rounded-full -top-1 -right-1 animate-pulse"></div>
                            </div>
                        </div>
                        <h1 className="mb-2 text-3xl font-black text-white md:text-4xl">
                            LETHAL BOTS
                        </h1>
                        <div className="text-lg font-semibold tracking-wider text-cyan-300">
                            2025 • QR SCANNER
                        </div>
                        <div className="w-24 h-1 mx-auto mt-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"></div>
                    </div>

                    {/* Status Messages */}
                    {error && (
                        <div className="p-4 mb-6 border bg-red-900/50 border-red-500/50 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center space-x-3">
                                <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-400" />
                                <span className="text-sm text-red-300">{error}</span>
                            </div>
                        </div>
                    )}

                    {scanResult && (
                        <div className="p-4 mb-6 border bg-green-900/50 border-green-500/50 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-400" />
                                <div className="text-sm text-green-300">
                                    <div className="font-semibold">Team Registered!</div>
                                    <div className="mt-1 break-all opacity-75">{scanResult}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Camera Feed */}
                    <div className="relative mb-6">
                        <div className="relative overflow-hidden bg-black border-2 border-gray-700 shadow-2xl rounded-2xl">
                            {/* Scanner Frame Overlay */}
                            {isScanning && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                    <div className="relative w-64 h-64 border-2 border-cyan-400 rounded-2xl">
                                        {/* Corner accents */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 rounded-tl-lg border-cyan-400"></div>
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 rounded-tr-lg border-cyan-400"></div>
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 rounded-bl-lg border-cyan-400"></div>
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 rounded-br-lg border-cyan-400"></div>
                                        
                                        {/* Scanning line */}
                                        {scanningActive && (
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                                        )}
                                        
                                        {/* Center crosshair */}
                                        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                                            <Target className="w-8 h-8 text-cyan-400 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="object-cover w-full bg-gray-900 h-80"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            
                            {/* Camera overlay when not active */}
                            {!isScanning && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                                    <div className="text-center">
                                        <Camera className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                                        <p className="text-lg text-gray-400">Camera Off</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="space-y-4">
                        {!isScanning ? (
                            <button 
                                onClick={startCamera}
                                className="w-full px-6 py-4 font-bold text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl hover:scale-105 active:scale-95"
                            >
                                <div className="flex items-center justify-center space-x-3">
                                    <Camera className="w-6 h-6" />
                                    <span className="text-lg">ACTIVATE CAMERA</span>
                                </div>
                            </button>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                <button 
                                    onClick={startQRScanning}
                                    disabled={scanningActive || isSubmitting}
                                    className="w-full px-6 py-4 font-bold text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-500 disabled:to-gray-600 rounded-xl hover:scale-105 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center space-x-3">
                                        {scanningActive ? (
                                            <>
                                                <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                                <span className="text-lg">SCANNING...</span>
                                            </>
                                        ) : isSubmitting ? (
                                            <>
                                                <div className="w-6 h-6 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                                <span className="text-lg">SUBMITTING...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Scan className="w-6 h-6" />
                                                <span className="text-lg">SCAN QR CODE</span>
                                            </>
                                        )}
                                    </div>
                                </button>

                                <button 
                                    onClick={stopCamera}
                                    className="w-full px-6 py-4 font-bold text-white transition-all duration-300 transform shadow-lg bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 rounded-xl hover:scale-105 active:scale-95"
                                >
                                    <div className="flex items-center justify-center space-x-3">
                                        <Square className="w-6 h-6" />
                                        <span className="text-lg">STOP CAMERA</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Scanned Teams Counter */}
                    {scannedTeams.length > 0 && (
                        <div className="p-4 mt-8 border border-gray-600 bg-gray-800/50 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Shield className="w-5 h-5 text-green-400" />
                                    <span className="font-semibold text-white">Teams Registered</span>
                                </div>
                                <div className="px-3 py-1 text-sm font-bold text-white bg-green-500 rounded-full">
                                    {scannedTeams.length}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-8 text-center">
                        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                            <Zap className="w-4 h-4" />
                            <span>Powered by Lethal Bots 2025</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;