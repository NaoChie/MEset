# ME(set)

(ME)set is a scheduler and focus timer app that helps you set tangible times for mind breaks. During said breaks, the user is directed to conduct randomized tasks that call for productivity but allows for distraction free thinking times (e.g. folding clothes, yoga, reading, hand-washing dishes, etc.).

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
- [Future features/current bugs](#future-features/current-bugs)

## Features

- Date and time alarm scheduler
- Random activity generator from preset list of "mindful, distraction-free, productive" activities
- Countdown for 15 minute breaks that are conducted once alarm is set off

## Getting Started

1. Clone the repository:
   git clone https://github.com/NaoChie/SoftEng_Andrew.git
2. Install dependencies:
    npx expo install expo-notifications
    npx expo install @react-native-community/datetimepicker
3. Start the app:
    cd ./your-path/SoftEng_Andrew
    npx expo start

## Future features/current bugs

1. Notifications are not being recieved properly by token. Will prioritize so countdown can appear and be set at will.
2. App will be split into two pages, where user will be first recieved by break scheduler, and then break activity/countdown.
3. Alarm sounds will be amplified and played for longer periods of time.
4. Recommended activities, set alarm, and break length will be editable.