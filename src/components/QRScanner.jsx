import {
    AlertCircle,
    Camera,
    CheckCircle,
    Square,
    Shield,
    Target,
    Scan,
    Bot,
    ChevronRight,
    Activity,
    Sparkles,
    Cpu,
    Wifi,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const QRScanner = () => {
    const [scannedTeams, setScannedTeams] = useState([]);
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scanningActive, setScanningActive] = useState(false);
    const [pulseAnimation, setPulseAnimation] = useState(false);
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
        setPulseAnimation(true);
        scanIntervalRef.current = setInterval(async () => {
            const qrCode = await detectQRCode();
            console.log('qrCode : ', qrCode);
            if (qrCode) {
                setScanningActive(false);
                setPulseAnimation(false);
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
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950">
            {/* Animated Background Grid */}
            <div className="absolute inset-0 opacity-20">
                <div 
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(14, 165, 233, 0.1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(14, 165, 233, 0.1) 1px, transparent 1px)
                        `,
                        backgroundSize: '30px 30px',
                        animation: 'grid-move 20s linear infinite',
                    }}
                />
                <style>
                    {`
                        @keyframes grid-move {
                            0% { transform: translate(0, 0); }
                            100% { transform: translate(30px, 30px); }
                        }
                    `}
                </style>
            </div>

            {/* Floating Orbs with Enhanced Animation */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute w-32 h-32 rounded-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 blur-xl top-16 left-8 animate-pulse" 
                     style={{animationDelay: '0s', animationDuration: '3s'}}></div>
                <div className="absolute w-24 h-24 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-xl top-28 right-12 animate-pulse" 
                     style={{animationDelay: '1s', animationDuration: '4s'}}></div>
                <div className="absolute w-40 h-40 rounded-full bg-gradient-to-r from-blue-400/20 to-indigo-400/20 blur-xl bottom-16 left-16 animate-pulse" 
                     style={{animationDelay: '2s', animationDuration: '5s'}}></div>
                <div className="absolute w-20 h-20 rounded-full bg-gradient-to-r from-pink-400/20 to-rose-400/20 blur-xl bottom-32 right-8 animate-pulse" 
                     style={{animationDelay: '3s', animationDuration: '3.5s'}}></div>
            </div>

            {/* Circuit Pattern Overlay */}
            <div 
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2314b8a6' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Cpath d='M30 28V0h2v28h-2zm0 4v28h2V32h-2zm28-2H32v-2h26v2zm-28 0H0v-2h30v2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }}
            />

            <div className="relative z-10 min-h-screen p-4 md:p-6">
                <div className="max-w-md mx-auto space-y-6">
                    {/* Enhanced Header */}
                    <div className="mb-8 text-center">
                        <div className="flex justify-center mb-6">
                            <div className="relative group">
                                <div className="absolute inset-0 transition duration-300 opacity-75 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-3xl blur-lg group-hover:opacity-100"></div>
                                <div className="relative flex items-center justify-center w-20 h-20 border shadow-2xl bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl border-cyan-400/30">
                                    <Bot className="w-10 h-10 text-cyan-400" />
                                </div>
                                <div className="absolute flex items-center justify-center w-6 h-6 rounded-full shadow-lg bg-gradient-to-r from-green-400 to-emerald-400 -top-2 -right-2 animate-pulse">
                                    <Wifi className="w-3 h-3 text-white" />
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-3">
                            <h1 className="text-3xl font-black text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text animate-pulse">
                                LETHAL BOTS
                            </h1>
                            <div className="flex items-center justify-center space-x-2 text-lg font-bold text-gray-300">
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                                <span>2025</span>
                                <Sparkles className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div className="inline-flex items-center px-4 py-2 space-x-2 border rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/30 backdrop-blur-sm">
                                <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
                                <span className="text-sm font-semibold tracking-wide text-cyan-300">QR SCANNER</span>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Error Alert */}
                    {error && (
                        <div className="relative overflow-hidden border bg-red-900/40 border-red-500/50 rounded-2xl backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-pink-600/20 animate-pulse"></div>
                            <div className="relative flex items-center p-4 space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/20">
                                    <AlertCircle className="w-4 h-4 text-red-400" />
                                </div>
                                <div className="text-sm font-medium text-red-200">{error}</div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Success Alert */}
                    {scanResult && (
                        <div className="relative overflow-hidden border bg-emerald-900/40 border-emerald-500/50 rounded-2xl backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 animate-pulse"></div>
                            <div className="relative p-4">
                                <div className="flex items-center mb-2 space-x-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20">
                                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div className="text-sm font-bold text-emerald-200">TEAM REGISTERED SUCCESSFULLY!</div>
                                </div>
                                <div className="p-2 font-mono text-xs break-words rounded-lg ml-11 text-emerald-300/80 bg-emerald-950/30">
                                    {scanResult}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Camera Feed */}
                    <div className="relative group">
                        <div className="absolute inset-0 transition duration-300 opacity-50 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 rounded-3xl blur-lg group-hover:opacity-75"></div>
                        <div className="relative overflow-hidden border bg-black/50 border-gray-600/50 rounded-3xl backdrop-blur-sm">
                            {isScanning && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                                    <div className="relative">
                                        {/* Scanning Frame */}
                                        <div className="relative w-56 h-56">
                                            <div className={`absolute inset-0 rounded-2xl border-4 border-cyan-400/80 ${pulseAnimation ? 'animate-pulse' : ''}`}></div>
                                            
                                            {/* Corner Brackets */}
                                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-cyan-400"></div>
                                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-cyan-400"></div>
                                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-cyan-400"></div>
                                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-cyan-400"></div>
                                            
                                            {/* Scanning Line */}
                                            {scanningActive && (
                                                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-ping" 
                                                     style={{
                                                         top: '50%',
                                                         animation: 'scan-line 2s linear infinite',
                                                     }}></div>
                                            )}
                                            
                                            {/* Center Target */}
                                            <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                                                <div className="relative">
                                                    <Target className="w-8 h-8 text-cyan-400 animate-pulse" />
                                                    <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <video 
                                ref={videoRef} 
                                autoPlay 
                                playsInline 
                                className="object-cover w-full h-64 bg-gradient-to-br from-gray-900 to-black rounded-3xl"
                            />
                            <canvas ref={canvasRef} className="hidden" />
                            
                            {!isScanning && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900/95 to-black/95 rounded-3xl backdrop-blur-sm">
                                    <div className="text-center">
                                        <div className="relative mb-4">
                                            <div className="absolute inset-0 rounded-full opacity-50 bg-gradient-to-r from-cyan-400 to-blue-400 blur-lg"></div>
                                            <div className="relative flex items-center justify-center w-16 h-16 border rounded-full bg-gradient-to-r from-slate-800 to-slate-700 border-cyan-400/30">
                                                <Camera className="w-8 h-8 text-cyan-400" />
                                            </div>
                                        </div>
                                        <p className="mb-1 text-base font-bold text-gray-300">Scanner Standby</p>
                                        <p className="text-sm text-gray-500">Activate to begin scanning</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <style>
                            {`
                                @keyframes scan-line {
                                    0% { top: 10%; opacity: 0; }
                                    50% { opacity: 1; }
                                    100% { top: 90%; opacity: 0; }
                                }
                            `}
                        </style>
                    </div>

                    {/* Enhanced Action Buttons */}
                    <div className="space-y-3">
                        {!isScanning ? (
                            <button 
                                onClick={startCamera}
                                className="relative w-full overflow-hidden transition-all duration-300 transform shadow-lg group bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:from-cyan-600 hover:via-blue-600 hover:to-purple-600 rounded-2xl hover:scale-105 hover:shadow-cyan-500/25"
                            >
                                <div className="absolute inset-0 transition duration-300 opacity-0 bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:opacity-20"></div>
                                <div className="relative flex items-center justify-center px-6 py-4 space-x-3">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-lg font-bold text-white">ACTIVATE CAMERA</span>
                                    <ChevronRight className="w-5 h-5 text-white transition duration-300 group-hover:translate-x-1" />
                                </div>
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <button 
                                    onClick={startQRScanning}
                                    disabled={scanningActive || isSubmitting}
                                    className="relative w-full overflow-hidden transition-all duration-300 transform shadow-lg group bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-600 disabled:to-gray-700 rounded-2xl hover:scale-105 hover:shadow-emerald-500/25 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    <div className="absolute inset-0 transition duration-300 opacity-0 bg-gradient-to-r from-emerald-400 to-teal-400 group-hover:opacity-20"></div>
                                    <div className="relative flex items-center justify-center px-6 py-4 space-x-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                                            {(scanningActive || isSubmitting) ? (
                                                <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                                            ) : (
                                                <Scan className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <span className="text-lg font-bold text-white">
                                            {isSubmitting ? "PROCESSING..." : scanningActive ? "SCANNING..." : "INITIATE SCAN"}
                                        </span>
                                    </div>
                                </button>
                                
                                <button 
                                    onClick={stopCamera}
                                    className="relative w-full overflow-hidden transition-all duration-300 transform shadow-lg group bg-gradient-to-r from-red-500 via-pink-500 to-rose-500 hover:from-red-600 hover:via-pink-600 hover:to-rose-600 rounded-2xl hover:scale-105 hover:shadow-red-500/25"
                                >
                                    <div className="absolute inset-0 transition duration-300 opacity-0 bg-gradient-to-r from-red-400 to-pink-400 group-hover:opacity-20"></div>
                                    <div className="relative flex items-center justify-center px-6 py-4 space-x-3">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                                            <Square className="w-5 h-5 text-white" />
                                        </div>
                                        <span className="text-lg font-bold text-white">DEACTIVATE CAMERA</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Stats Counter */}
                    {scannedTeams.length > 0 && (
                        <div className="relative overflow-hidden border bg-gradient-to-r from-gray-800/40 to-gray-900/40 border-gray-600/30 rounded-2xl backdrop-blur-sm">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 to-teal-600/10"></div>
                            <div className="relative p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20">
                                            <Shield className="w-5 h-5 text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">Teams Registered</div>
                                            <div className="text-xs text-gray-400">Scan complete</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="px-4 py-2 text-2xl font-black text-white shadow-lg bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                                            {scannedTeams.length}
                                        </div>
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Footer */}
                    <div className="pt-6 text-center">
                        <div className="inline-flex items-center px-4 py-2 space-x-2 border rounded-full bg-gradient-to-r from-gray-800/50 to-gray-900/50 border-gray-600/30 backdrop-blur-sm">
                            <div className="relative">
                                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
                                <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping"></div>
                            </div>
                            <span className="text-xs font-semibold text-gray-300">Powered by Lethal Bots Neural Network</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;