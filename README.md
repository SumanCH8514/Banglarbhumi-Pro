# BanglarBhumi Pro

> Modern, high-performance real-time land record and revenue intelligence platform for West Bengal.  
> **A SumanOnline Project**

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL_3.0-blue.svg?style=flat-square)](LICENSE)
[![Live Portal](https://img.shields.io/badge/Live_Production-wblandrecord.sumanonline.com-2ea44f.svg?style=flat-square&logo=googlechrome&logoColor=white)](https://wblandrecord.sumanonline.com/)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org)
[![Fastify](https://img.shields.io/badge/Fastify-3.x-black.svg?style=flat-square)](https://www.fastify.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Profile](https://img.shields.io/badge/Author-SumanCH8514-orange.svg?style=flat-square&logo=github)](https://github.com/SumanCH8514)

---

> 🌐 **Live Production Link**: [https://wblandrecord.sumanonline.com/](https://wblandrecord.sumanonline.com/)  
> 🚀 **Direct Application**: [https://wblandrecord.sumanonline.com/app](https://wblandrecord.sumanonline.com/app)

---

## Overview

**BanglarBhumi Pro** is an open-source, enterprise-grade web application and automation suite designed for seamless querying, inspection, and verification of official West Bengal land revenue records (`banglarbhumi.gov.in`).

Traditional portal interactions often suffer from restrictive session management, viewport horizontal truncation on mobile devices, and clunky record navigations. BanglarBhumi Pro bridges this gap with:
- **Instant Search**: Fast queries by Plot Number (দাগ নম্বর) or Khatian Number (খতিয়ান নম্বর) across all 23 districts and mouzas.
- **Dual Presentation**: Switch effortlessly between a responsive Modern Ledger View and an authentic 1:1 Directorate of Land Records & Surveys format.
- **Cadastral Map Visualization**: Interactive vector parcel geometry preview with zoom and boundary indicators.
- **One-Click Export**: Professional revenue certificate PDFs ready for A4 printing and UTF-8 encoded Excel CSV exports.

---

## Features

- **Multi-Mode Search Engine**: Query land records by Plot Number (দাগ) or Khatian Number (খতিয়ান) across West Bengal.
- **Dual Presentation Views**:
  - **Modern Ledger**: Clean, interactive table with instant client-side filtering, share calculators, and possessor modals.
  - **Official Portal View**: Exact replication of the Directorate format with touch-friendly horizontal swipe support on smartphones.
- **Cadastral Plot Map Visualizer**: Interactive SVG-rendered land parcel preview with zoom and dimensional scales.
- **Possessor & Bargadar Inspector**: Deep inspection of tenancy remarks, recorded co-sharers, and statutory section notices.
- **Export & Print Ready**:
  - Official A4 Revenue Certificate PDF export with clean formatting.
  - UTF-8 BOM CSV export for Microsoft Excel and spreadsheet tools.
- **Automated Citizen Session Bridge**: Embedded login workflow supporting captcha retrieval, OTP handling, and session caching.
- **Privacy & Security First**: Session tokens and browser cache remain strictly local; zero third-party analytics, tracking, or cloud database storage.

---

## Tech Stack

| Layer | Technologies & Tools |
|---|---|
| **Frontend** | Vanilla HTML5, Modern CSS3 (Grid & Flexbox), Vanilla ES6+ JavaScript |
| **Backend** | Node.js, Fastify 3.x, Asynchronous SSL Connection Pooling |
| **Automation** | Puppeteer Stealth, Chrome DevTools Protocol (CDP) |
| **Container** | Docker Multi-Stage Build, Debian Chromium Runtime, FreeFonts Bengali |
| **Tooling** | npm, Nodemon, ESLint |

---

## Folder Structure

```
BanglarBhumi Pro/
├── backend/
│   ├── controllers/       # Route request handlers (portal, citizen auth)
│   ├── data/              # District/Block mappings & offline sample records
│   ├── plugins/           # Fastify middleware and static file handlers
│   ├── routes/            # REST API endpoints (/api/v1/*)
│   ├── services/          # Puppeteer browser engine & portal scraping logic
│   └── utils/             # Session managers & certificate generators
├── frontend/
│   ├── css/               # Modular CSS (app.css, landing.css, responsive)
│   ├── js/                # Client controllers, state managers, exporters
│   ├── index.html         # Modern product landing page (/)
│   └── app.html           # Core application workspace (/app)
├── .dockerignore          # Docker build exclusion rules
├── .env.example           # Environment template with sensible defaults
├── .gitignore             # Comprehensive secret and cache exclusion rules
├── Dockerfile             # Production container definition
├── LICENSE                # AGPL-3.0 open-source license
├── package.json           # Project manifest and scripts
├── README.md              # Project documentation
└── server.js              # Application entry point
```

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18.0.0 or higher
- [Google Chrome](https://www.google.com/chrome/) or Chromium installed locally (or via Docker)
- [Git](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/SumanCH8514/Banglarbhumi-Pro.git
cd Banglarbhumi-Pro
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

Create your local `.env` configuration from the provided template:

```bash
cp .env.example .env
```

| Variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port for the web server |
| `HOST` | `0.0.0.0` | Network host binding address |
| `NODE_ENV` | `development` | Runtime environment (`development` / `production`) |
| `CHROME_DEBUG_PORT` | `9222` | Remote debugging port for Puppeteer |
| `PUPPETEER_EXECUTABLE_PATH` | *(auto-detected)* | Optional path to custom Chrome binary |

### 4. Run the Application

**Development Mode (Hot Reloading):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

Access the platform locally:
- **Landing Page**: `http://localhost:3000/`
- **Application Interface**: `http://localhost:3000/app`

Or visit the deployed production instance:
- **Live Production**: [https://wblandrecord.sumanonline.com/](https://wblandrecord.sumanonline.com/)
- **Live Application**: [https://wblandrecord.sumanonline.com/app](https://wblandrecord.sumanonline.com/app)

---

## Usage

### 1. Land Record Query
1. Select the **District**, **Block**, and **Mouza** from the interactive dropdown cascades.
2. Choose your query mode: **Plot Number (দাগ)** or **Khatian Number (খতিয়ান)**.
3. Enter the target number (e.g., Plot `165` or Khatian `200`).
4. Click **Search Record** to fetch real-time ownership details, total area, and plot classification.

### 2. Switching Display Formats
- Click the **Modern Tabular** toggle to analyze records with real-time text search and share calculations.
- Click the **Official Portal Format** toggle to view the authentic state government layout with full mobile horizontal scroll support.

### 3. Exporting Records
- **PDF Certificate**: Click **Export PDF** to generate an A4 official revenue certificate with land schedule summary and ownership tables.
- **CSV Data**: Click **Export CSV** for instant download compatible with Excel and data analysis pipelines.

---

## Docker Deployment

Deploying with Docker guarantees a preconfigured Chromium environment with Bengali typography support:

```bash
# Build the Docker image
docker build -t banglarbhumi-pro .

# Run the container
docker run -d -p 3000:3000 --shm-size=1gb --name banglarbhumi-app banglarbhumi-pro
```

Access the containerized instance at `http://localhost:3000/`.

## Security & Privacy

### Authentication & Local Session Management
- **No Remote Credential Storage**: BanglarBhumi Pro does not store your citizen login password or phone number in any external database or cloud service. 
- **Direct Handshake**: During Citizen Sign-In, credentials, captcha, and OTP tokens are sent directly over secure HTTPS to the official state portal (`banglarbhumi.gov.in`) to obtain a standard session cookie.
- **Local-Only Persistence**: Active session cookies and Puppeteer browser state are saved strictly on your local machine (`backend/data/citizen_session.json` and `.banglarbhumi-browser/`). These files are ignored by `.gitignore` and `.dockerignore` so they will never accidentally be included in git commits or Docker builds.

### Zero Telemetry & Privacy
- **Direct Communication**: Network traffic occurs strictly between your local server and the official Banglarbhumi servers.
- **No Third-Party Trackers**: No tracking pixels, Google Analytics, telemetry pings, or third-party CDNs are loaded. Land records you search remain entirely on your own device.

### Offline Testing & Safe Development
- **Included Mock Data**: For testing, styling tweaks, and UI review, you do not need to connect to the state portal or have an active citizen account. The repository includes an offline dataset (`backend/data/plot_165_bankura.json`) so you can verify features locally without touching government infrastructure.

### Responsible Use & Disclaimer
- This project is an independent open-source tool created to provide a faster, mobile-accessible viewer for West Bengal citizen land records.
- Please use responsibly: do not run automated stress tests, aggressive bulk scrapers, or high-frequency loops against state servers. Users are expected to comply with the official portal's terms of service.

---

## Contributing

Contributions make the open-source community thrive. Any contributions you make are greatly appreciated:

1. Fork the Project (`https://github.com/SumanCH8514/Banglarbhumi-Pro/fork`)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m "feat: add AmazingFeature"`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the **GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**. See [`LICENSE`](LICENSE) for more information.

---

## Author & Contact

**Suman** (SumanOnline)  
- Live Portal: [wblandrecord.sumanonline.com](https://wblandrecord.sumanonline.com/)
- GitHub: [@SumanCH8514](https://github.com/SumanCH8514)  
- Project Repository: [Banglarbhumi-Pro](https://github.com/SumanCH8514/Banglarbhumi-Pro)
