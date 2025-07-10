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
import Logo from '../assets/logo.jpg'

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
        <div className="relative h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">
            {/* Floating Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-24 h-24 rounded-full bg-cyan-400/10 blur-xl top-16 left-8 animate-pulse"></div>
                <div className="absolute w-20 h-20 delay-300 rounded-full bg-purple-400/10 blur-xl top-28 right-12 animate-pulse"></div>
                <div className="absolute w-32 h-32 delay-700 rounded-full bg-blue-400/10 blur-xl bottom-16 left-16 animate-pulse"></div>
                <div className="absolute w-16 h-16 delay-1000 rounded-full bg-pink-400/10 blur-xl bottom-32 right-8 animate-pulse"></div>
            </div>

            {/* Noise Texture Overlay */}
            <div 
                className="absolute inset-0 opacity-20 mix-blend-overlay"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            ></div>

            <div className="relative z-10 p-4 md:p-6 max-h-[90vh] overflow-y-auto">
                <div className="max-w-lg mx-auto space-y-4">
                    {/* Header */}
                    <div className="mb-4 text-center">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div className="flex items-center justify-center w-16 h-16 overflow-hidden bg-white shadow-2xl rounded-2xl">
                                    <img src={Logo} alt="Lethal Bots Logo" className="object-contain w-full h-full" />
                                </div>
                                <div className="absolute w-4 h-4 bg-red-500 rounded-full shadow-lg -top-1 -right-1 animate-pulse shadow-red-500/50"></div>
                            </div>
                        </div>
                        <h1 className="mb-1 text-xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text">
                            LETHAL BOTS
                        </h1>
                        <div className="mb-1 text-base font-bold tracking-widest text-gray-300">
                            2025
                        </div>
                        <div className="inline-block px-4 py-1 text-xs font-semibold border rounded-full text-cyan-300 border-cyan-500/30 bg-cyan-500/10 backdrop-blur-sm">
                            QR SCANNER
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-center p-3 space-x-2 text-sm text-red-200 border bg-red-900/30 border-red-500/40 rounded-xl">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Success */}
                    {scanResult && (
                        <div className="p-3 text-sm border bg-emerald-900/30 border-emerald-500/40 rounded-xl text-emerald-200">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                                <div>
                                    <strong>Team Registered!</strong>
                                    <div className="mt-1 text-xs break-words opacity-75">{scanResult}</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Camera Feed */}
                    <div className="relative">
                        <div className="relative overflow-hidden border bg-black/50 border-gray-600/50 rounded-2xl backdrop-blur-sm">
                            {isScanning && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                    <div className="relative w-48 h-48">
                                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 p-0.5 animate-pulse">
                                            <div className="w-full h-full bg-transparent rounded-xl"></div>
                                        </div>
                                        {scanningActive && (
                                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse"></div>
                                        )}
                                        <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                                            <Target className="w-7 h-7 text-cyan-400 animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="object-cover w-full h-56 bg-gray-900 rounded-2xl"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            {!isScanning && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/90 to-black/90 rounded-2xl backdrop-blur-sm">
                                    <div className="text-center">
                                        <Camera className="w-12 h-12 mx-auto text-gray-500" />
                                        <p className="mt-1 text-sm font-semibold text-gray-300">Camera Standby</p>
                                        <p className="text-xs text-gray-500">Tap to activate</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-2">
                        {!isScanning ? (
                            <button 
                                onClick={startCamera}
                                className="w-full px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 rounded-xl"
                            >
                                <div className="flex items-center justify-center space-x-2">
                                    <Camera className="w-5 h-5" />
                                    <span>ACTIVATE CAMERA</span>
                                </div>
                            </button>
                        ) : (
                            <>
                                <button 
                                    onClick={startQRScanning}
                                    disabled={scanningActive || isSubmitting}
                                    className="w-full px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        {(scanningActive || isSubmitting) ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                                <span>{isSubmitting ? "SUBMITTING..." : "SCANNING..."}</span>
                                            </>
                                        ) : (
                                            <>
                                                <Scan className="w-5 h-5" />
                                                <span>SCAN QR CODE</span>
                                            </>
                                        )}
                                    </div>
                                </button>
                                <button 
                                    onClick={stopCamera}
                                    className="w-full px-4 py-3 text-base font-bold text-white bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 rounded-xl"
                                >
                                    <div className="flex items-center justify-center space-x-2">
                                        <Square className="w-5 h-5" />
                                        <span>STOP CAMERA</span>
                                    </div>
                                </button>
                            </>
                        )}
                    </div>

                    {/* Counter */}
                    {scannedTeams.length > 0 && (
                        <div className="p-4 text-sm text-white border border-gray-600/30 bg-gray-800/20 rounded-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                    <span>Teams Registered</span>
                                </div>
                                <div className="px-3 py-1 font-bold rounded-md bg-gradient-to-r from-emerald-500 to-teal-500">
                                    {scannedTeams.length}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="pt-4 text-xs text-center text-gray-400">
                        <div className="flex items-center justify-center space-x-2">
                            <Zap className="w-4 h-4 text-cyan-400" />
                            <span>Powered by Lethal Bots 2025</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default QRScanner;