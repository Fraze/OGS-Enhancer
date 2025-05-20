# OGS Enhancer - Chrome Extension

Enhance your Go playing experience on [Online-Go.com](https://online-go.com/) (OGS) with custom visual and audio effects!

## Features

The OGS Enhancer adds exciting events to your games:

* **"First Blood" Video & Sound:** Triggers a special video effect (with audio) the first time stones are captured in a game.
* **Win Celebration:**
    * Displays a "Black Wins!" or "White Wins!" message.
    * Showers the screen with confetti.
    * Plays a custom sound effect for Black's victory and a different one for White's victory.
* **User-Configurable Options:**
    * Enable or disable the "First Blood" effect.
    * Enable or disable the "Win Celebration" effects (message, confetti, and win sounds).
    * Globally toggle all audio (mutes the "First Blood" video and the win sounds).
* **Extension Icon:** Provides an extension icon in the Chrome toolbar. Clicking the icon opens the options page.
* **Options on Install/Update:** The options page automatically opens when the extension is first installed or updated, allowing for immediate configuration.

## Installation

1.  Download the extension files (or clone this repository).
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable "Developer mode" (usually a toggle in the top right corner).
4.  Click "Load unpacked".
5.  Select the folder where you downloaded/cloned the extension files.
6.  The "OGS Enhancer" icon should appear in your Chrome toolbar. Click it to configure the options.

## Configuration

After installation, or by clicking the extension icon, you can access the options page to:

* Toggle the "First Blood" effect on/off.
* Toggle the "Win Celebration" (winner message, confetti, and win sounds) on/off.
* Toggle all audio for the extension on/off.

## Included Media

This extension uses the following media files (located in the extension's root directory):

* `first_blood.webm`: Video displayed for the "First Blood" effect.
* `black_wins.mp3`: Sound effect played when Black wins.
* `white_wins.mp3`: Sound effect played when White wins.
* `icons/`: This folder contains the icons for the extension (`icon16.png`, `icon32.png`, `icon48.png`, `icon128.png`).

## Sound Effect Generation

The custom sound effects for Black wins and White wins were generated using [ElevenLabs](https://elevenlabs.io/). The voice model used was "Sexy Female Villain Voice".

## Development Notes

This extension is built using HTML, CSS, and JavaScript. It manipulates the DOM of `online-go.com` to detect game events and display effects.

Key components:

* `manifest.json`: Defines the extension's properties, permissions, and scripts.
* `content.js`: Injected into `online-go.com` pages to monitor game state and trigger effects.
* `style.css`: Styles for the visual effects.
* `options.html` & `options.js`: Provide the user interface and logic for configuring the extension's settings.
* `background.js`: Handles events like clicking the extension icon and installation/updates.

## Contributing

Feel free to fork this repository, make improvements, and submit pull requests!

## License

This project is open source. Please see the `LICENSE` file for more details (if one is added).
