# 🤖 Lethal Bots 2025 - QR Scanner System

A modern, fully interactive **QR Code Scanning Web Application** developed using **React.js** and **Tailwind CSS**. This project was created to streamline the registration process for the **Lethal Bots 2025** event by scanning team details from QR codes and saving them into a **Google Sheet** using Google Apps Script.

---

## 📌 Description

⚡ **Lethal Bots 2025 - QR Scanner System**  
An advanced QR code scanning web application built using React.js and Tailwind CSS, featuring real-time camera access, animated UI, and seamless integration with Google Sheets. This system is designed for registering team information in events or competitions by extracting structured data from QR codes and submitting it to a centralized spreadsheet. Developed for the Lethal Bots 2025 event, this tool ensures fast, reliable, and user-friendly registration and data tracking.


---

## 🚀 Features

- 📷 Real-time camera access using `getUserMedia`
- 🔍 Automatic QR code detection with `BarcodeDetector`
- 📤 Instant data submission to Google Sheets via a webhook
- 🔁 Scanning loop with loading and activity indicators
- ✅ Duplicate prevention for previously scanned teams
- 🎨 Fully responsive and animated UI using Tailwind CSS
- 📊 Status updates for errors, successful submissions, and camera state

---

## 📦 Technologies Used

- **React.js** – Frontend framework
- **Tailwind CSS** – Styling and layout
- **BarcodeDetector API** – Native QR code detection
- **Google Apps Script Webhook** – Google Sheet integration

---

## 🛠️ How It Works

1. **Activate Camera** – Launches the device's environment-facing camera.
2. **Scan QR Code** – Scans and parses structured data (like university, team name, etc.).
3. **Prevent Duplicates** – Ensures each QR code is only accepted once.
4. **Send Data to Google Sheet** – Sends scanned data to a connected Google Sheet via a public Google Apps Script endpoint.

---

## 📁 Project Structure

```
/src
│
├── /components          # UI Elements
├── /pages               # QRScanner Page
├── QRScanner.js         # Main scanner component
├── App.js               # App entry point
└── index.js             # React root render
```

---

## 🔐 Google Sheets Integration

To connect your Google Sheet:

1. Go to [Google Apps Script](https://script.google.com)
2. Paste your script and deploy as a web app
3. Update `GOOGLE_SCRIPT_URL` in `QRScanner.js` with your deployment URL

---

## 📌 Future Enhancements

- 📱 Mobile camera orientation handling
- 🧾 Manual input fallback mode
- 🛡️ Authentication layer for secure submissions
- 📊 Analytics dashboard for scanned data

---

## 📄 License

This project was built exclusively for the **Lethal Bots 2025** event and is not licensed for commercial redistribution. Contact the author for academic or collaborative use.

---

## 🙌 Acknowledgements

- Google Developers for [BarcodeDetector API](https://developer.mozilla.org/en-US/docs/Web/API/BarcodeDetector)
- Google Sheets + Apps Script for backend data handling
