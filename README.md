# OmniScan Pro | Advanced Barcode Scanner

OmniScan Pro is a high-performance, browser-based 1D and 2D barcode scanner designed for speed and reliability. It features local persistence, multiple camera support, and CSV export capabilities.

![Scanner Interface Mockup](https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/scan.svg)

## ✨ Features

- 📸 **Multi-Camera Support**: Easily switch between front, back, and external USB cameras.
- 🚀 **High Performance**: Optimized scanning for 1D (EAN, UPC, Code 128) and 2D (QR, Data Matrix) codes.
- 💾 **Local Persistence**: Scanned data is saved locally in your browser using `localStorage`.
- 📊 **CSV Export**: Export your scanned history to a CSV file for inventory management or auditing.
- 🟢 **Live Feedback**: Real-time visual, audio, and haptic feedback on successful scans.
- 🌑 **Premium UI**: Modern glassmorphism design with responsive support for mobile and desktop.
- 🔒 **Privacy Focused**: No data ever leaves your browser. All processing and storage are local.

## 🛠️ Technology Stack

- **Frontend**: Vanilla JavaScript + Vite
- **Scanner Engine**: [html5-qrcode](https://github.com/mebjas/html5-qrcode)
- **Styling**: Modern Vanilla CSS
- **Deployment**: GitHub Actions + GitHub Pages

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [bun](https://bun.sh/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/barcode-scanner-app.git
   cd barcode-scanner-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🚢 Deployment

The project is configured for easy deployment via **GitHub Actions**.

1. Push your code to the `main` branch.
2. In your GitHub repository, go to **Settings > Pages**.
3. Set **Source** to **GitHub Actions**.
4. The app will be automatically built and deployed.

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgements

- Built with [html5-qrcode](https://github.com/mebjas/html5-qrcode) for robust camera handling.
- Icons by [Lucide](https://lucide.dev/).
