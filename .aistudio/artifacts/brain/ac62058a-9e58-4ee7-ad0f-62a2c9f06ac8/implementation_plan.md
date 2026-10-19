# Complete Removal of Map, Location & GPS Features

Cleanly deprecate and remove all map, geolocation, and location-prompting features across EcoEat, streamlining the student onboarding flow and organizing campus peer trading alphabetically by student name without distance or location tracking.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural and user experience decisions have been aligned based on your responses:

- **Confirmed Decision 1 (Sign-Up Flow)**: Completely remove all location prompts and address fields from the student registration and onboarding process. The sign-up form focuses strictly on student name, school email, grade/section, and password.
- **Confirmed Decision 2 (Student Trading Organization)**: Campus trading partners are sorted alphabetically by student name (`A` to `Z`) instead of relying on proximity, GPS coordinates, or location distances.
- **Confirmed Decision 3 (Profile & Trading Badges)**: Student cards display academic identity (Level, Grade, and Homeroom e.g., "Grade 10-A") without location markers or distance indicators.
- **Confirmed Decision 4 (Permissions & Dependencies)**: Remove device `geolocation` permission from `metadata.json` and prune unused map libraries (`leaflet`, `@types/leaflet`) from project dependencies.

---

### 1. Overview & Core Concept

- **What It Does**: Transforms EcoEat into a privacy-first, zero-tracking campus dining and food sustainability platform. Students can sign up and trade stickers without granting GPS permissions or entering physical location addresses.
- **Target Audience / Persona**: BBS PIK students, homeroom teachers, and eco-club coordinators who want a frictionless, distraction-free app focused on meal waste logging, nutrition tracking, and collectible sticker swaps.
- **Key Value**: Instant registration with fewer form fields, complete student privacy with no location tracking, and clean, fast peer-to-peer sticker trading.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Student Registration*: The student enters their Full Name, selects Grade (e.g., Grade 9) and Section (A–D), inputs their School Email, and creates a Password. No location modal, GPS prompt, or address input is shown.
  2. *Collectible Sticker Trading*: In the Sticker Shop's "Students on Campus Ready to Trade" section and the Sticker Trade Modal, peers are listed in clear alphabetical order with avatar, student name, eco level, and homeroom badge (e.g., "⭐ Level 4 · Grade 10-A").
  3. *Settings & Privacy*: No location permission switches or location status badges appear in student settings.
- **Visual Identity & Theme**:
  - *Color Palette & Surfaces*: Adheres to the established campus palette (60% dark slate / clean canvas, 30% theme cards, 10% emerald/accent highlights).
  - *Zero-Pill Typography*: Clean unboxed student metadata separated by subtle typographic dots (`·`).
  - *Header Contract*: Streamlined top navigation and clean student header without location badges.
- **Interactive Feedback & Motion**:
  - Instant alphabetical peer filtering with subtle list transitions.
  - Zero browser geolocation permission popups upon opening or registering.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Elimination of Location Prompts During Sign-Up**
  - *Chosen Approach*: Omit location fields entirely from the registration form and validation schema.
  - *Why*: Reduces cognitive load, eliminates friction during registration, and honors student privacy.
  - *Alternatives Considered*: Retaining an optional manual text address field; rejected based on confirmed preference to remove location prompts completely.
- **Decision 2: Alphabetical Sorting for Trading Partners**
  - *Chosen Approach*: Sort active student trading peers alphabetically by `name` (`localeCompare`).
  - *Why*: Predictable, easy to scan, and deterministic for students looking for specific classmates.
  - *Alternatives Considered*: Sorting by recent activity timestamp or grade grouping. Alphabetical was selected by user confirmation.
- **Decision 3: Complete Removal of Map Library Footprint**
  - *Chosen Approach*: Prune `leaflet` and `@types/leaflet` from `package.json` and remove `"geolocation"` from `metadata.json`.
  - *Why*: Eliminates bundle bloat, reduces unused runtime dependencies, and stops browsers from requesting location privileges.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                    Student Client UI                        │
├──────────────────────────────┬──────────────────────────────┤
│      SignIn / SignUp         │        Sticker Shop          │
│   (Name, Email, Grade, Pwd)  │   (Alphabetical Partners)    │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Campus Sync Service                       │
│    - Presence heartbeat (online status, lastActiveAt)       │
│    - Alphabetical peer ordering without coordinates         │
│    - Sticker trade proposals (senderUid -> receiverUid)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Firestore Database                         │
│    - /users/{userId}: Student Profile & Homeroom            │
│    - /stickerTrades/{tradeId}: Trade Offers & Status        │
└─────────────────────────────────────────────────────────────┘
```

- **Data Model Clean-up**:
  - `src/types.ts`: Remove deprecated location properties (`locationName`, `latitude`, `longitude`, `locationAddress`, `locationMapUri`, `locationAccuracy`, `locationUpdatedAt`) from `UserProfile` and `LeaderboardUser`.
  - `firebase-blueprint.json`: Update the intermediate schema for `users` and `stickerTrades` to omit coordinates and campus location names.
  - `metadata.json`: Update `requestFramePermissions` from `["camera", "geolocation"]` to `["camera"]`.
  - `src/context/LanguageContext.tsx`: Clean up obsolete location translation keys across all 5 supported languages.
  - `package.json`: Remove `leaflet` and `@types/leaflet` dependencies.
