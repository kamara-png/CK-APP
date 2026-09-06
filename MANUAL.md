# CK-APP — Developer Manual

This is a complete guide to how CK-APP is built, what every folder and file does, and — most importantly — exactly where to go to change things. It's written for someone who has never seen this codebase before but knows basic React/TypeScript.

**Repo:** https://github.com/kamara-png/CK-APP

---

## 1. What this app is, in one paragraph

CK-APP is a personal productivity app with four tabs — **Todos**, **Streaks**, **Statistics**, and a **Profile drawer** (opened via the hamburger icon, not a tab) — plus a separate **Notes** section. It's built with **Expo + Expo Router** on the frontend and **Convex** as a realtime backend database. There is no login system: everyone using the same Convex deployment shares the same data, which is fine for one person but worth knowing if you ever add more users.

---

## 2. The tech stack, briefly

| Piece | What it does | Where it's configured |
|---|---|---|
| **Expo** | The framework that runs the React Native app, bundles it, and talks to Expo Go for testing | `app.json`, `package.json` |
| **Expo Router** | Turns files in `app/` into screens/routes automatically — no manual navigation setup | The `app/` folder itself |
| **Convex** | The backend database. Functions you write in `convex/*.ts` become callable from the app in realtime | `convex/` folder |
| **TypeScript** | Type safety across the whole app | `tsconfig.json` |
| **react-native-gesture-handler** | Powers swipe-to-complete/delete and swipe-between-tabs | Used inside components, not a separate config |
| **react-native-reanimated** | Powers the smooth sliding animation of the Profile drawer | `components/ProfileDrawer.tsx` |
| **expo-notifications** | Schedules local reminder notifications for todos | `lib/notifications.ts` |
| **@expo-google-fonts/inter** | The app's font (see §9) | `app/_layout.tsx` |

You do **not** need to know Convex or Expo Router deeply to make most of the customizations in this guide — the recipes in §10 tell you exactly which file to open.

---

## 3. Folder-by-folder tour

### `app/` — every screen in the app

Expo Router turns each file here into a real navigable screen. The **folder structure IS the navigation structure** — there's no separate "routes" config file to maintain.

```
app/
├── _layout.tsx              ← wraps the ENTIRE app (see §3.1)
├── (tabs)/                  ← the bottom tab bar lives here
│   ├── _layout.tsx          ← defines the 3 tabs and their icons
│   ├── index.tsx            ← the "Todos" tab (this is the home/default tab)
│   ├── streaks.tsx           ← the "Streaks" tab
│   └── statistics.tsx        ← the "Statistics" tab
└── notes/                   ← Notes feature, opened from the Todos screen
    ├── index.tsx             ← list of all notes
    └── [id].tsx              ← the note editor (the `[id]` means "any note ID")
```

A folder named with parentheses, like `(tabs)`, is an Expo Router convention meaning "group these screens under a tab bar, but don't add `/tabs` to the URL." You'll basically never need to touch this convention — just know it's not a typo.

#### 3.1 `app/_layout.tsx` — the root of everything

This file wraps literally every screen in the app. It's responsible for, in order:

1. **Loading the Inter font** (`useFonts`) and blocking render until it's ready — this is why the app briefly shows a blank dark screen on launch.
2. **Connecting to Convex** — reads `EXPO_PUBLIC_CONVEX_URL` from your `.env.local` file. If that variable is missing, this file shows a friendly red error screen instead of silently freezing (this was a real bug we hit and fixed — see §11).
3. **Setting up notifications** (`configureNotifications()`) so reminder notifications work.
4. **Wrapping everything in `GestureHandlerRootView`** — required for swipe gestures to work anywhere in the app.
5. **Declaring the top-level navigation stack** — currently just `(tabs)` (the tab bar) plus the two `notes/` screens, registered to open as modals (`presentation: "modal"`).

If you ever add a whole new top-level screen (not a tab, not a note — something like a full-screen onboarding flow), you register it here as a new `<Stack.Screen name="..." />`.

#### 3.2 `app/(tabs)/_layout.tsx` — the tab bar itself

This is a short file that lists exactly 3 `<Tabs.Screen>` entries: `index` (Todos), `streaks`, `statistics`. Each one sets:
- `title` — the label under the icon
- `tabBarIcon` — which Ionicons icon to show (see §10.2 for how to change these)

**There is intentionally no 4th tab for the profile/settings.** That's opened separately — see §3.6.

#### 3.3 `app/(tabs)/index.tsx` — the Todos screen (the biggest file in the app)

This is the most feature-dense screen. It handles:
- The search bar
- The list of todos, grouped with date headers ("Today", "Yesterday", or a date) whenever the day changes between consecutive todos
- Swipe-to-complete (swipe right) and swipe-to-delete (swipe left) on each row, via `SwipeableRow`
- The pencil "edit" icon per row, which opens `TodoEditor`
- Delete via the trash icon **or** swipe, both of which go through a 1-second "undo" window (see §8.1) before actually deleting
- The floating "+" button (FAB) bottom-right, which opens `AddTodoModal` to create a new todo
- After a todo is created, `ReminderEditor` automatically opens so you can immediately set a reminder — this is the "baked into creation" reminder flow
- The hamburger icon (top-left) which opens the `ProfileDrawer`
- The whole screen is wrapped in `SwipeTabScreen` so swiping left/right switches tabs

#### 3.4 `app/(tabs)/streaks.tsx` — the habit tracker

Shows a card per habit with: a flame badge + current streak number, name, a 7-day dot history, and the big flame check-in button. Tapping "+" opens `HabitEditor` to create a new habit (name + color). Swiping a card left checks it in for today; swiping right deletes it (same `SwipeableRow` component as Todos, for a consistent feel across the app).

#### 3.5 `app/(tabs)/statistics.tsx` — the stats screen

Reads from **both** the Todos backend and the Habits backend, and renders:
- A circular completion-rate ring (`ProgressRing`)
- Total / Completed / Remaining cards
- A "Productivity" section (todos completed today, average time-to-complete, upcoming reminders)
- A Completed-vs-Remaining bar chart
- A "Added this week" bar chart (`WeeklyActivityChart`)
- A "Streaks overview" section (active streaks, best streak, total check-ins) — only shows if you have at least one habit

#### 3.6 The Profile drawer — not a file in `app/`, a component

Unlike the tabs, the Profile "screen" isn't a route at all — it's `components/ProfileDrawer.tsx` + `components/ProfileContent.tsx`, rendered directly inside `app/(tabs)/index.tsx` and toggled open/closed with local state (`drawerOpen`). It slides in from the left over whatever tab you're on. Inside it: your editable name + photo, the theme picker, the stats summary, and the "danger zone" (clear all todos).

#### 3.7 `app/notes/` — the Notes feature

- `index.tsx` — the list of notes, with search and a "+" button that creates a blank note and jumps straight into editing it.
- `[id].tsx` — the actual note editor. Has a Write/Preview toggle, a formatting toolbar, a color picker, and shows "Linked from" backlinks at the bottom.

---

### `components/` — every reusable piece of UI

Nothing in here is a screen by itself — these are building blocks used *inside* the screens above.

| File | What it does |
|---|---|
| `AddTodoModal.tsx` | The small popup for typing a new todo (opened by the FAB) |
| `DangerZone.tsx` | The "Clear All Todos" button + confirmation, shown in the Profile drawer |
| `DateTimeField.tsx` | A button that opens native date-then-time pickers and combines them into one `Date` |
| `FormattingToolbar.tsx` | The B / I / heading / checklist / bullet / link / code buttons in the note editor |
| `HabitEditor.tsx` | The "New streak" popup (name + color) |
| `MarkdownRenderer.tsx` | Turns note text into formatted output in Preview mode — headers, bold, checklists, `[[links]]` |
| `Preferences.tsx` | The dark-mode switch + theme picker grid, shown in the Profile drawer |
| `ProfileContent.tsx` | The actual content inside the drawer: avatar, name, then Preferences/ProgressStats/DangerZone |
| `ProfileDrawer.tsx` | The sliding panel + backdrop mechanics (animation only — content lives in `ProfileContent`) |
| `ProgressRing.tsx` | The circular percentage ring on Statistics |
| `ProgressStats.tsx` | The Total/Completed/Remaining mini-cards shown in the Profile drawer |
| `ReminderEditor.tsx` | The popup for picking a reminder date/time/sound |
| `SwipeableRow.tsx` | Wraps any row to add swipe-left/swipe-right actions (used by both Todos and Streaks) |
| `SwipeTabScreen.tsx` | Wraps a whole tab screen so swiping left/right switches to the next/previous tab |
| `TodoEditor.tsx` | The popup for editing an existing todo's text + reminder together |
| `UndoToast.tsx` | The little "Todo deleted [UNDO]" banner at the bottom of the screen |
| `WeeklyActivityChart.tsx` | The 7-day bar chart on Statistics |

---

### `convex/` — the backend

This is where your data actually lives and where the rules for reading/writing it are defined. Convex has a specific mental model worth understanding:

- **`schema.ts`** defines every table and what fields each row can have. If you want to store a new piece of data, it starts here.
- **Every other file** (`todos.ts`, `notes.ts`, `habits.ts`) defines **queries** (read-only, realtime-subscribed functions) and **mutations** (functions that change data). The app calls these by name — e.g. `api.todos.getTodos`.
- **`_generated/`** is auto-created by running `npx convex dev` — never edit it by hand. It's how the app knows what functions exist and gets type-checking for free.

| File | Table(s) it manages | Key functions |
|---|---|---|
| `schema.ts` | Defines `todos`, `notes`, `habits`, `habitCheckins` | — |
| `todos.ts` | `todos` | `getTodos`, `addTodo`, `toggleTodo`, `updateTodo`, `setReminder`, `deleteTodo`, `clearAllTodos` |
| `notes.ts` | `notes` | `getNotes`, `getNote`, `createNote`, `updateNote`, `deleteNote`, `findNoteByTitle`, `getBacklinks` |
| `habits.ts` | `habits`, `habitCheckins` | `getHabitsOverview`, `createHabit`, `deleteHabit`, `toggleCheckin` |

**Important habit:** any time you change `schema.ts` or add a new function, you must have `npx convex dev` running locally — it's what actually pushes those changes to your live Convex deployment. Nothing works until it does.

---

### `hooks/` — shared logic used across multiple screens

- **`useTheme.tsx`** — the single most important file for visual customization. See §9.
- **`useSlowLoadingHint.ts`** — a tiny helper that shows "still connecting..." text if a Convex query hasn't resolved after 6 seconds, so a slow connection doesn't look like a silent freeze.

### `lib/` — plain logic that isn't React-specific

- **`notifications.ts`** — wraps `expo-notifications`: requests permission, schedules a reminder, cancels one.
- **`streaks.ts`** — pure date-math: computes current/longest streak and the last-7-days dot history from a list of check-in dates. All done using the *phone's local date*, deliberately, so a streak doesn't break due to timezone confusion.
- **`profile.ts`** — reads/writes the profile name (AsyncStorage) and profile photo (copies the picked photo into the app's own storage so it survives restarts).

### `assets/` — images, fonts, and (2 leftover) style files

- **`assets/images/`** — app icon, splash screen, adaptive icons.
- **`assets/styles/settings.styles.ts`** — shared style definitions used by `Preferences.tsx`, `ProgressStats.tsx`, and `DangerZone.tsx` (the Profile drawer's sections).
- **`assets/styles/home.styles.ts`** — ⚠️ **this file is unused.** It's leftover from an earlier draft of the Todos screen before it was rewritten with its own inline styles. Safe to delete, or safe to ignore.

---

## 4. How the theme system works (this is the key file for visual customization)

Everything about colors flows through **`hooks/useTheme.tsx`**. Understanding this file well is the single highest-leverage thing you can do to customize the app's look.

There are two independent concepts:
- **Accent** — which color identity: `"default"`, `"duolingo"`, `"instagram"`, or `"obsidian"`
- **Mode** — `"light"` or `"dark"`

Every accent has *both* a light and dark palette, so there are 8 total looks. Each palette is a `ColorScheme` object with fields like `bg`, `surface`, `text`, `textMuted`, `primary`, `success`, `warning`, `danger`, `border`, and a few gradient/background sub-objects.

Every screen in the app calls `const { colors } = useTheme()` at the top, then references `colors.text`, `colors.primary`, etc. **Nothing is ever hardcoded to a specific hex value inside a screen** — that's what makes instant theme-switching possible. If you ever see a raw hex color inside a screen file (outside of `useTheme.tsx` itself), that's a place someone bypassed the system — worth fixing for consistency.

The chosen accent + mode are saved via `AsyncStorage` so they persist between app launches, and there's a small migration path in there for older versions of the saved data (you can ignore that block unless you're renaming these keys).

---

## 5. How reminders and notifications actually work

When you set a reminder on a todo, two things happen:
1. The reminder's date/time/sound gets saved to the `todos` table in Convex (`reminderAt`, `reminderSound`).
2. `lib/notifications.ts` schedules an actual local OS notification via `expo-notifications`, using a predictable ID (`todo-reminder-<todoId>`) so re-scheduling or clearing a reminder always replaces the old one instead of creating duplicates.

**Two real limitations, not bugs:**
- **Local notifications work fine in Expo Go.** This was confirmed against Expo's own docs — the thing that *doesn't* work in Expo Go anymore is remote/push notifications, which this app doesn't use at all.
- **You cannot pick an arbitrary custom ringtone.** This isn't an Expo limitation — no app on iOS or Android can access "the ringtones on your phone" for a notification sound. Sounds must be bundled into the app at build time. That's why the sound picker only offers "Default" and "Silent."

---

## 6. How the Notes markdown system works

`components/MarkdownRenderer.tsx` is a **hand-written, lightweight parser** — not a third-party markdown library. It goes line-by-line and recognizes:
- `# `, `## `, `### ` → headings
- `- [ ] text` / `- [x] text` → tappable checklists
- `- text` → bullet points
- `**bold**`, `*italic*` or `_italic_`, `` `code` `` → inline formatting
- `[[Note Title]]` → tappable links. Tapping one searches your other notes by title; if found, it navigates there; if not, it offers to create a new note with that title (same behavior as Obsidian).

The formatting toolbar (`FormattingToolbar.tsx`) doesn't render anything itself — it just inserts the right markdown symbols around whatever text you've selected in the editor.

Backlinks ("Linked from") are computed by a Convex query (`getBacklinks`) that scans all notes' content for `[[thisNote'sTitle]]` — there's no separate "links" table, it's computed on the fly.

---

## 7. How the Streaks/habit math works

All of this lives in **`lib/streaks.ts`**, deliberately kept separate from any UI code so it's easy to test or reuse:

- **`getLocalDateKey(date)`** turns a `Date` into a `"YYYY-MM-DD"` string using the *phone's own timezone* — never the server's. This matters: if streak math were done on the Convex server, a check-in near midnight could land on the wrong day for someone in a different timezone.
- **`computeStreakStats(dateKeys)`** — the actual streak logic. Notably: if you haven't checked in *today* yet but you did check in *yesterday*, your streak is still shown as "alive" rather than already broken — this matches how most habit-streak apps behave (you don't lose your streak until the day is actually over).
- **`getLast7Days(dateKeys)`** — powers the little dot row on each habit card.

---

## 8. Two UX patterns worth understanding, since they're used more than once

### 8.1 The "undo delete" pattern

When you delete a todo, it isn't actually deleted right away. `app/(tabs)/index.tsx` hides it from the list immediately (optimistic UI) and starts a 1-second timer. If you tap "Undo" before that timer fires, the timer is cancelled and the todo reappears — the real Convex `deleteTodo` call never happened. If you don't tap Undo, the timer fires and the real deletion goes through. This is why deletion feels instant but is still reversible for a moment.

### 8.2 The "swipe row" pattern

`SwipeableRow.tsx` is a generic wrapper — it doesn't know or care whether it's wrapping a todo or a habit. You give it `onSwipeComplete`, `onSwipeDelete`, and two colors, and it handles the swipe animation and reveal. This is why Todos and Streaks feel consistent with each other despite being completely different data underneath.

---

## 9. The font (Inter, not real "San Francisco")

Apple's actual San Francisco font is licensed for use on Apple platforms only — bundling it into an Android-capable app would violate Apple's license terms. Instead, `app/_layout.tsx` loads **Inter** (`@expo-google-fonts/inter`), an openly-licensed (SIL Open Font License) font that's geometrically very close to SF Pro — it's the standard "free San Francisco alternative" used across the industry for exactly this situation.

It's applied globally by overriding `Text.defaultProps` and `TextInput.defaultProps` in `app/_layout.tsx`, rather than adding `fontFamily: "Inter_400Regular"` to every single style block across the whole app individually. If you ever want a different global font, that's the one place to change it — search for `applyGlobalFont` in `app/_layout.tsx`.

---

## 10. Customization cookbook — step-by-step recipes

### 10.1 Add a brand-new color theme

Open **`hooks/useTheme.tsx`**:
1. Add your new name to the `ThemeAccent` type (e.g. `"sunset"`).
2. Add it to the `ACCENT_OPTIONS` array with a display label.
3. Copy an existing palette (e.g. `duolingoLight`/`duolingoDark`) and change every hex value to your new colors — do both a light and dark version.
4. Add both to the `palettes` object at the bottom.
5. Open **`components/Preferences.tsx`** and add an icon for your new accent in the `accentIcons` map.

That's it — every screen picks it up automatically since they all read from `useTheme()`.

### 10.2 Change which icon a tab uses, or its order

Open **`app/(tabs)/_layout.tsx`**. Each `<Tabs.Screen>` has a `tabBarIcon` — swap the `name="..."` for any [Ionicons name](https://icons.expo.fyi). Reordering the `<Tabs.Screen>` blocks in the file changes the order they appear in the tab bar. If you reorder them, also update the `TAB_ORDER` array in **`components/SwipeTabScreen.tsx`** so swipe-navigation matches the new order.

### 10.3 Add a whole new tab

1. Create a new file, e.g. `app/(tabs)/mynewtab.tsx`, exporting a default React component.
2. Add a `<Tabs.Screen name="mynewtab" ... />` entry in `app/(tabs)/_layout.tsx`.
3. If you want swipe-to-switch to include it, add its path to `TAB_ORDER` in `SwipeTabScreen.tsx` and wrap its content in `<SwipeTabScreen path="/mynewtab">`.

### 10.4 Add a new field to a todo (e.g. a "priority" level)

1. Open `convex/schema.ts` — add the field to the `todos` table, e.g. `priority: v.optional(v.union(v.literal("low"), v.literal("high")))`.
2. Open `convex/todos.ts` — add it as an argument to `addTodo` and/or `updateTodo`, and pass it through to `ctx.db.insert`/`ctx.db.patch`.
3. Run `npx convex dev` locally so the schema change actually deploys.
4. Update `components/TodoEditor.tsx` (or `AddTodoModal.tsx`) to let the person set it, and `app/(tabs)/index.tsx` to display it on each row.

### 10.5 Change the FAB (the floating "+" button)

It's the `styles.fab` block plus its `<TouchableOpacity>` near the bottom of `app/(tabs)/index.tsx`. Change `backgroundColor`, `width`/`height` (keep them equal for a circle), or the Ionicons `name` for the icon inside it.

### 10.6 Add a new stat to the Statistics screen

Open `app/(tabs)/statistics.tsx`. The `productivityCards` array (or `cards` for the main three) is a plain list of `{ label, value, icon, color }` objects rendered by `.map()`. Compute your new value from the `todos` or `habitsOverview` query results already available in that file, add it to the array, and it'll render automatically in the existing grid layout.

### 10.7 Add a new markdown formatting option to Notes

1. Open `components/FormattingToolbar.tsx` — add a new button and a new value to the `FormatAction` type.
2. Open `app/notes/[id].tsx` — add a case for it in the `applyFormat` function (decide what text gets wrapped around the selection).
3. Open `components/MarkdownRenderer.tsx` — add a matching regex/render rule if it needs special *display* treatment (checklists and wiki-links are the two existing examples of this).

### 10.8 Change the reminder sound options

Open `components/ReminderEditor.tsx` and `components/TodoEditor.tsx` — both have a `SOUND_OPTIONS` array (`"default"` / `"silent"`). Remember: you can only ever offer sounds you've actually bundled into the app at build time (see §5) — you can't add an option for a sound that doesn't physically exist as a file in the project.

### 10.9 Rename the app or change its icon

Open `app.json`:
- `"name"` and `"slug"` — the app's display name and internal identifier
- `"icon"` — path to the app icon image (must exist in `assets/images/`)
- `"splash"` config inside the `plugins` array — the loading screen image

### 10.10 Change what the hamburger menu / Profile drawer contains

Open `components/ProfileContent.tsx` — everything inside its `<ScrollView>` is what shows up in the drawer. Add, remove, or reorder components here directly (it currently renders `ProgressStats`, `Preferences`, and `DangerZone` in that order, after the avatar/name row).

---

## 11. Things that look like bugs but are actually known, deliberate limitations

- **No user accounts.** Everyone hitting the same Convex deployment shares the same todos/notes/habits. Fine for one person on one phone; would need real auth (e.g. Convex Auth) before multiple people should use it.
- **Swipe-between-tabs is a discrete gesture, not a true drag.** A proper Instagram-style pager (where content visually follows your finger) would require replacing Expo Router's whole tab navigator with a custom pager-based one — a much bigger, riskier change. What's built instead: swipe far enough and fast enough, and it snaps to the next/previous tab.
- **Profile name/photo are stored only on the device**, not in Convex — deliberate, since there's no per-user backend concept yet (see the first bullet). If you add real auth later, this is the first thing to move into Convex.
- **`assets/styles/home.styles.ts` is dead code** (§3, Assets section) — don't be confused if you go looking for where it's used.

---

## 12. Day-to-day dev workflow

Two terminals, both need to be running at the same time:

```powershell
# Terminal 1 — keeps your Convex backend in sync with schema.ts / *.ts changes
npx convex dev

# Terminal 2 — the actual app
npx expo start
```

After pulling new code from GitHub, always run `npm install` before starting Expo again — skipping this is the #1 cause of "Cannot find module" or "Failed to resolve plugin" errors when a new package has been added.

**Expo Go and SDK versions:** Expo Go on your phone only ever supports one exact SDK version at a time, and it auto-updates from the Play Store/App Store. If you ever see "project is incompatible with this version of Expo Go," it means your phone's Expo Go moved to a newer SDK than this project targets. Either sideload an old matching build from `expo.dev/go`, or upgrade the whole project's dependencies to match (a much bigger, riskier operation — see the git history around the SDK 57 upgrade attempt for what that involves).

---

## 13. Quick glossary

- **Expo** — the toolchain that builds/runs this React Native app.
- **Expo Go** — the app on your phone used to preview your project without building a real standalone app.
- **Expo Router** — turns files in `app/` into screens automatically.
- **SDK version** — a specific bundle of compatible library versions Expo ships together. The project and your Expo Go client must match.
- **Convex** — the realtime backend database this app uses instead of a traditional REST API.
- **Query** (Convex) — a read-only function; the app automatically re-renders when the underlying data changes.
- **Mutation** (Convex) — a function that changes data.
- **Schema** — the definition of what tables and fields exist in the database.
- **`tsc`** — the TypeScript compiler; running it with `--noEmit` just checks for type errors without producing output.
