<div align="center">

# Stillday 🌿

### Build small habits. Find your rhythm.

A calm, minimal habit tracker designed to help you build consistency one day at a time.

</div>

---

## ✨ About

**Stillday** is a personal habit-tracking mobile app built with React Native and Expo. It helps you keep track of daily habits, review your progress, and manage your data in a clean, distraction-free interface.

The app uses a soft, earthy visual style and supports light, dark, and system appearance modes.

## 📱 Features

- **Daily Habit Tracking** — View your habits and mark daily progress.
- **Calendar View** — Explore habit completion across dates.
- **Insights** — Review your habit progress and consistency.
- **Habit Management** — Create, view, edit, and delete habits.
- **Appearance Settings** — Choose light mode, dark mode, or follow your device's system setting.
- **Reminder Preferences** — Configure reminder preferences and time in the interface. Notification scheduling is planned for a later development stage.
- **Data Backup** — Export habit data and completion history as JSON.
- **Data Restore** — Import a backup to restore your habits and completion history.
- **Reset Data** — Clear habit and completion data when needed.

## 🛠️ Built With

- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [TypeScript](https://www.typescriptlang.org/)
- [NativeWind](https://www.nativewind.dev/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Bun](https://bun.sh/) or another compatible JavaScript package manager
- [Node.js](https://nodejs.org/) if required by your local Expo tooling
- [Expo development tools](https://docs.expo.dev/get-started/installation/)

### Installation

**1. Clone the repository**

```bash
git clone <your-repository-url>
```

**2. Navigate to the project directory**

```bash
cd sprout
```

**3. Install dependencies**

```bash
bun install
```

**4. Start the Expo development server**

```bash
bunx expo start
```

Follow the Expo CLI instructions to open the app in a supported simulator or development environment.

> **Note:** Some native features may require a development build rather than Expo Go.

## 🗺️ Development Roadmap

Stillday is actively being developed. Planned and ongoing work includes:

- [x] Core habit tracking and habit management
- [x] Calendar and progress insights
- [x] Settings and appearance preferences
- [x] JSON backup export and import
- [x] Light and dark theme support across the app
- [ ] Complete app-wide visual polish
- [ ] Audit data persistence and date/time handling
- [ ] Implement and test scheduled notifications
- [ ] Final device testing and release preparation

The roadmap may change as development continues.

## 📂 Project Structure

The main application code is organized under `src/`:

```text
src/
├── app/          # Expo Router screens and tab navigation
├── constants/    # Shared theme and app constants
├── hooks/        # Theme, habits, and completion state
├── services/     # Backup, import, and related services
└── types/        # TypeScript types
```

The exact structure may evolve as the project grows.

## 🧪 Project Status

Stillday is a work in progress and is not yet presented as a final production release.

Core tracking, calendar, insights, settings, and backup flows are implemented. Further polish, persistence checks, notification scheduling, and release testing remain.

## 🤝 Contributing

This is currently a personal learning and development project. Suggestions and feedback are welcome.

If you want to contribute, please open an issue first to discuss the proposed change.

## 📄 License

No license has been added yet. Unless a license is included in this repository, all rights remain with the project owner, and reuse is not automatically permitted.

---

<div align="center">

Made with care, one small habit at a time 🌱

</div>
