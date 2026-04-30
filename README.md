# DK64 Randomizer Hint Viewer

A Twitch extension and broadcaster dashboard for managing and revealing hints during [DK64 Randomizer](https://dk64randomizer.com) runs. Viewers see hints update live in the extension panel; broadcasters control what's revealed from the DKHome dashboard.

## Installing the Extension

1. Go to `dashboard.twitch.tv/<your-username>` and open the **Extensions** tab
2. Search for **HintViewer** and click **Install**
3. Activate it as a panel on your channel page

## Getting Started

Go to [hintviewer.com](https://hintviewer.com) and log in with your Twitch account. There are two ways to load your hints:

- **Upload:** Upload the spoiler log JSON generated with "Generate Spoiler Log" enabled. Hints are populated automatically, including Progressive hint batches and Foolish / WOTH grouping.
- **Create:** Manually enter hints for your seed with no file needed. Use the **Edit** button to update hints at any time and **Create New Hint Template** to start fresh.

## Revealing Hints

Each hint row has action buttons:

- **Eye:** Reveals the hint text to viewers. Click again to hide.
- **Check** (appears after revealing): Marks the hint as completed. Completed hints appear struck through for viewers.
- **Edit** (appears after completing): Select the item found at that location. It shows with an alert indicator in the extension.

Hints with identical text are linked. Revealing or completing one will automatically reveal or complete all others with the same hint text.

Use the **Reveal Area** button to bulk-reveal all hints on the current level page, or **Reveal All** to reveal everything at once.

## Hint Types

**Non-Progressive hints** are color-coded by Kong based on the Wrinkly Kong door frame color in that level:

| Color | Kong |
|-------|------|
| Yellow | Donkey Kong |
| Red | Diddy Kong |
| Blue | Lanky Kong |
| Purple | Tiny Kong |
| Green | Chunky Kong |

For example, a red door frame in Jungle Japes means the hint is listed under **Jungle Japes, Diddy**.

**Progressive hints** are grouped into Batches automatically. Check the in-game hint tracker in the pause menu to see which batch you've unlocked, then use **Reveal Area (Batch #)** to unlock the full batch at once.

**Foolish** and **WOTH** hints are grouped automatically when those keywords appear in a hint.

## Changelog

See [CHANGELOG.md](CHANGELOG.md).
