<div align="center">
  <img src="https://raw.githubusercontent.com/ajith/lan-file-share/main/docs/logo.png" alt="LAN File Share Logo" width="120" />

  # 🚀 LAN File Share

  **Instant, Secure, Offline-First File Transfer for Local Networks**

  [![Java](https://img.shields.io/badge/Java_21-ED8B00?style=for-the-badge&logo=java&logoColor=white)](https://java.com)
  [![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
  [![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

  *Fast. Peer-to-Peer feel. Zero Internet Required.*

  [View Demo](#demo) • [Download](#quick-start-for-recruiters) • [Architecture](#architecture)
</div>

---

## ⚡ Quick Start (For Recruiters)
Want to see it in action without building from source? This app runs **100% offline** on your local network.

1. **Download the App:** Go to the [Releases Tab](../../releases) and download `LAN_File_Share.zip`.
2. **Run it:** Extract the ZIP and double-click `LAN_File_Share.exe` on your PC. 
3. **Connect your Phone:** Open the app on your PC, scan the QR code with your mobile device (must be on the same Wi-Fi), and start transferring files instantly!

*(Note: No data is sent to the cloud. Everything stays on your local network.)*

---

## 🎥 Live Demonstration
*(Insert GIF or Video demonstrating dragging a file on PC and it instantly appearing on the mobile phone)*
![App Demo](docs/demo.gif)

---

## ✨ Features
* **Zero Internet Required:** Uses your router's Local Area Network (LAN) to transfer files.
* **Auto-Discovery (mDNS):** Devices automatically find each other on the network without typing IP addresses.
* **Real-time Sync:** Powered by WebSockets. When a file drops on one screen, it instantly appears on the other.
* **Cross-Platform:** The server runs as a Windows `.exe`, and the client is a responsive PWA that works beautifully on iOS and Android browsers.
* **Dangerous File Blocking:** Built-in security to prevent the transfer of malicious executable files.
* **Auto-Expiring Files:** Files are automatically cleaned up to prevent storage bloating.

---

## 🏗️ Architecture
This project utilizes a decoupled architecture, served from a single executable for ease of use.

```mermaid
graph TD
    subgraph Local Area Network (LAN)
        PC[PC (Server/Client)]
        Mobile[Mobile Device (Client)]
        Tablet[Tablet (Client)]
    end

    subgraph "LAN_File_Share.exe (Spring Boot)"
        Web[Embedded Tomcat]
        WS[WebSocket Handler]
        mDNS[JmDNS Discovery]
        Storage[Local Temp Storage]
        React[React SPA (Static Files)]
    end

    PC <-->|8080| Web
    Mobile <-->|8080| Web
    Tablet <-->|8080| Web

    Web -.->|Serves| React
    React <-->|ws://| WS
    WS <--> Storage
    PC <-->|UDP 5353| mDNS
    Mobile <-->|UDP 5353| mDNS
```

### 🛠️ Tech Stack Explained
1. **Frontend (React + Vite):** A highly responsive Single Page Application. It uses generic CSS/Tailwind for a premium, glassmorphism UI. It is built and bundled directly into the backend's static resources.
2. **Backend (Spring Boot 3):** Handles REST API requests for file uploads, serves the React frontend, and manages the WebSocket connections for real-time state updates.
3. **Networking (mDNS):** Uses `jmdns` to broadcast the server's existence across the network, allowing mobile devices to discover the PC without manual IP entry.
4. **Packaging (Launch4j):** The entire application (JRE, Spring Boot server, React frontend) is packaged into a single, double-clickable Windows `.exe` for ultimate portability.

---

## 💻 Developer Setup
To run the project locally from source:

1. Clone the repository: `git clone https://github.com/ajith/lan-file-share.git`
2. **Build the Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```
3. **Run the Backend:**
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```
4. Access the app at `http://localhost:8080`

### Building the Executable (PC)
Run the included build script to compile everything into a single `.exe`:
```powershell
.\build_release.ps1
```

### Building the Android App (.apk)
The Android app is built using Capacitor. If you have Android Studio installed:
```bash
cd frontend
npm run build
npx cap sync
npx cap open android
```
From Android Studio, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

---
*Developed with ❤️ by Thamizh.*
