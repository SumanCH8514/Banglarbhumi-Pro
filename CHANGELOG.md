# Changelog

All notable changes to the BanglarBhumi Pro project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.1.0] - 2026-10-07

### Added
- **About Project Page**: Dedicated responsive `/about_project` (and `/about`) page presenting system architecture, design specifications, release versioning, and developer information.
- **Production Deployment Configuration**: Live portal domain linked to [https://wblandrecord.sumanonline.com/](https://wblandrecord.sumanonline.com/) with canonical and OpenGraph social metadata.
- **Offline Sample Datasets**: Pre-sanitized mock records (`backend/data/plot_165_bankura.json`) enabling zero-credential offline testing, UI styling, and PDF generation.
- **Cross-Platform Chromium Resolution**: Intelligent path locator supporting `PUPPETEER_EXECUTABLE_PATH`, `CHROME_BIN`, Debian/Ubuntu Chromium, macOS Chrome, and Windows binaries.
- **Comprehensive Project Governance**: Production-ready `README.md`, AGPL-3.0 license, and Docker multi-stage containerization.

### Changed
- **Mobile Touch-Scroll for Khatian Tables**: Redesigned official portal table wrapper with smooth horizontal touch-scrolling (`overflow-x: auto`) and touch inertia on iOS/Android.
- **Owner Name Wrapping**: Stripped restrictive `nowrap` table properties so lengthy Rayat names wrap cleanly across multiple lines without viewport clipping.
- **Navigation Enhancements**: Linked landing page, core application, and about pages with synchronized bilingual headers.

### Security
- **Strict Credential Exclusions**: Hardened `.gitignore` and `.dockerignore` to unconditionally ignore `.env`, `citizen_session.json`, and `.banglarbhumi-browser/`.
- **Zero Local Machine Leakage**: Eliminated hardcoded machine directory paths across backend controllers in favor of dynamic `path.resolve`.
- **Clean Source Distribution**: Audited and confirmed zero leftover developer comments across all CSS, JavaScript, and HTML source files.

---

## [1.0.0] - 2026-10-07

### Added
- Initial production release of BanglarBhumi Pro.
- Dual presentation mode: Modern Filterable Ledger and 1:1 Directorate of Land Records & Surveys official format.
- Real-time land record query engine by Plot Number (দাগ) and Khatian Number (খতিয়ান).
- High-resolution A4 PDF Revenue Certificate generator and UTF-8 BOM CSV exporter.
- Cadastral parcel visualizer with interactive SVG geometry.
- Citizen login bridge with real-time captcha and OTP automation.
- Fastify asynchronous backend with SSL connection pooling.
