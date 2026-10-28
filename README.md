# ClinixBridge 🩸
> **Understand Your Blood. Eat Better.**

ClinixBridge is a modern, clinical-grade mobile application designed to translate complex laboratory blood panels into actionable, culturally tailored Indian dietary guidance. Built with a local-first architecture, hardware-backed token security, and deterministic reference ranges.

[![Expo SDK 58](https://img.shields.io/badge/Expo-SDK%2058-000020?style=flat-square&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.88-61DAFB?style=flat-square&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![DPDP Act 2023](https://img.shields.io/badge/DPDP%20Act-2023%20Compliant-1F9D61?style=flat-square)](https://www.meity.gov.in)
[![Tests Passing](https://img.shields.io/badge/Tests-64%2F64%20Passing-success?style=flat-square&logo=jest)](https://jestjs.io)

---

## 🌟 Key Features

### 🩸 1. Deterministic Biomarker Engine
- **40+ Core Laboratory Biomarkers**: Evaluates CBC, Lipid Profile, Metabolic Panel, Liver (SGOT/SGPT), Renal (Creatinine/Urea), Thyroid (TSH/T3/T4), and Micronutrients (Vitamin D3, B12, Ferritin, Iron).
- **Zero-Hallucination Range Engine**: Evaluates values against strict age- and sex-banded clinical reference intervals (`src/features/analysis/referenceRanges.json`). Unknown markers are strictly categorized as `"not assessed"`, never guessed.

### 📸 2. Laboratory Report Extraction & Verification
- **Vision Extraction**: Supports camera snapshots, photo gallery, and PDF uploads (`expo-image-picker`, `expo-document-picker`).
- **Edge AI Integration**: Powered by Google Gemini Flash Vision via Supabase Edge Functions (`/supabase/functions/extract-report`) with schema-enforced JSON output.
- **Human-in-the-Loop Review**: Extracted parameters present an editable pre-confirmation screen with confidence scores before any data is committed to storage.

### 🍛 3. Indian Nutrition & 7-Day Meal Planner
- **Nutrient Mapping**: Correlates flagged biomarkers to whole-food nutrient cofactors (e.g., low Ferritin $\rightarrow$ non-heme iron + Vitamin C; elevated LDL $\rightarrow$ soluble fiber & limit saturated fats).
- **Dietary & Allergen Filtering**: 100% strict filtering for Vegetarian, Vegan, and Omnivore diets against declared sensitivities (Gluten, Dairy, Shellfish, Peanuts, Tree Nuts, Soy, Eggs).
- **Actionable Daily Plans**: Dynamic meal swapping, mark-as-eaten tracking, macro distribution (kcal, protein, carbs, fats), and consolidated weekly grocery list generation.

### 📈 4. Longitudinal Trend Analytics & PDF Export
- **Historical Trajectories**: Visualizes biomarkers across multiple test dates with shaded optimal reference zones and trajectory indicators (*improving*, *stable*, *attention required*).
- **Clinical Summary Export**: Generates branded, printer-ready PDF reports (`expo-print`, `expo-sharing`) containing user demographics, flagged biomarker gauges, and tailored nutrition recommendations.

### 🔒 5. Privacy-First & DPDP Act 2023 Compliance
- **Local-First SQLite Storage**: All blood reports, profiles, and meal plans are stored locally on-device (`expo-sqlite`).
- **India DPDP Act 2023 Compliance**: Includes statutory Section 5 notices, unbundled affirmative consent checkboxes (Section 6), Data Principal statutory rights (access, erasure, grievance redressal, withdrawal), and explicit DPO contact credentials.
- **Hardware-Backed Encryption**: Supabase Auth tokens are secured inside hardware-backed Android Keystore / iOS Keychain via `expo-secure-store`.
- **Strict HTTPS Only**: Rejects all unencrypted plaintext HTTP transmissions across network layers.
- **Right to Erasure**: Complete "Delete All My Data" flow purges all SQLite records and dispatches account deletion requests.

### 🎨 6. Premium Aesthetics & Accessibility
- **Typography & Theme**: Styled with Plus Jakarta Sans and a rich Crimson & Deep Maroon palette (`#B3141F`, `#6E0B14`, `#1E0709`).
- **WCAG Contrast & Font Scaling**: All contrast ratios adhere to WCAG AAA/AA standards. `maxFontSizeMultiplier={1.4}` enforces responsive font scaling without layout clipping.
- **Multi-Sensory Feedback**: Accessible `StatusChip` pairs iconography with text (never color alone). Tactile micro-interactions powered by `expo-haptics`.
- **States & Shimmer Skeletons**: Pre-built looping pulse skeletons (`SkeletonLoader`), empty states (`EmptyState`), and friendly error alerts (`ErrorState`).

---

## 🏗️ Architecture & Tech Stack

```
ClinixBridge
├── src/
│   ├── app/                    # Expo Router file-based screens & navigators
│   ├── components/             # Reusable UI system (Cards, Chips, Skeletons, Modals)
│   ├── data/                   # Indian foods database (foods.json) & mock data
│   ├── db/                     # expo-sqlite database initialization & migrations
│   ├── features/
│   │   ├── analysis/           # RangeEngine & 40+ clinical reference intervals
│   │   ├── auth/               # Supabase Email OTP modal
│   │   ├── home/               # Overview dashboard & flagged markers
│   │   ├── legal/              # DPDP 2023 Consent & Privacy Policy modals
│   │   ├── nutrition/          # 7-day meal planner, food suggestions & grocery list
│   │   ├── onboarding/         # Welcome introduction & multi-step profile intake
│   │   ├── profile/            # User settings, reminders, PDF export & data wipe
│   │   └── reports/            # Blood report review, biomarker list & upload sheets
│   ├── services/               # API clients, Supabase, PDF export, notifications
│   ├── store/                  # Zustand app state management
│   ├── theme/                  # Design tokens (colors, radii, shadows, typography)
│   └── utils/                  # Safe haptics & helper utilities
└── supabase/
    └── functions/              # Gemini Flash Vision report extraction & explanation
```

| Technology | Purpose |
| :--- | :--- |
| **Expo SDK 58** | Modern universal React Native toolchain & native modules |
| **Expo Router** | Type-safe, file-based routing and modal navigation |
| **Zustand** | Performant, boilerplate-free state management |
| **expo-sqlite** | Local-first relational database persistence |
| **expo-secure-store** | Hardware-backed Keychain/Keystore token encryption |
| **expo-notifications** | Local retest reminders (60 days) & daily meal check-ins |
| **expo-print & expo-sharing** | Local PDF summary generation & sharing |
| **expo-haptics** | Tactile feedback on taps, selections, and confirmations |
| **Supabase & Gemini Flash** | Optional cloud auth (Email OTP) & Vision report OCR |
| **Jest & jest-expo** | Comprehensive test suite (64/64 tests passing) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or newer)
- npm or bun
- Expo Go app on your phone, or an Android/iOS emulator

### 1. Clone the Repository
```bash
git clone https://github.com/Shrexshth/clinic.git
cd clinic
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npx expo start
```
- Press `a` to open in Android Emulator.
- Press `w` to open in Web Browser.
- Scan the displayed QR code with the **Expo Go** app on your physical device.

---

## 🧪 Testing & Verification

ClinixBridge maintains strict test coverage and type safety:

```bash
# Run complete test suite (64 unit & integration tests)
npm test

# Run TypeScript typecheck (0 errors)
npx tsc --noEmit

# Diagnose dependencies
npx expo-doctor
```

---

## 📦 Building a Standalone Android APK

EAS Build is configured in `eas.json` with a dedicated `preview` profile that compiles a standalone `.apk` directly installable on physical Android devices.

### 1. Log in to EAS
```bash
npx eas-cli login
```

### 2. Build the Standalone APK
```bash
npx eas-cli build -p android --profile preview
```

When completed, EAS provides a direct download link and a terminal QR code to install `ClinixBridge.apk` directly on your Android phone.

---

## ⚖️ Medical Disclaimer

> **IMPORTANT CLINICAL NOTICE**  
> ClinixBridge provides educational nutritional and biomarker information based on general laboratory reference intervals. It **does not** provide medical diagnosis, treatment plans, or prescription recommendations. Always seek the advice of a qualified physician or healthcare provider regarding any medical condition or before beginning any new nutritional program.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
