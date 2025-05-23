# AI Street Skate Battle 🛹

**Vibe coding with Three.js!** 🚀 Skate through an AI-powered street battle, built with passion and powered by Cursor, Claude, Gemini, and xAI's Grok. Experience dynamic 3D skateboarding with AI-controlled events and immersive visuals.

## Overview

**AI Street Skate Battle** is an arcade-style skateboarding game where players navigate procedurally generated city streets, perform tricks, grind rails, and dodge dynamic obstacles and events controlled by an AI. Built using **Three.js**, this game offers a vibrant, stylized 3D experience for casual gamers and fans of score-attack gameplay.

- **Genre:** Arcade Skating, Score Attack
- **Platform:** Web Browser (with potential for mobile ports)
- **Target Audience:** Casual gamers, arcade sports enthusiasts, players who love unpredictable gameplay

## Features

- **Core Mechanics:**
  - Intuitive movement with WASD keys (forward, backward, turning).
  - Jump (Space), grind (Shift near rails), and perform tricks like ollies (E).
  - Dodge AI-generated obstacles (traffic cones, dogs, pedestrians) and complete timed challenges.
- **Scoring System:**
  - Earn points for tricks, grinds, and combos.
  - Bonus points for navigating AI events successfully.
  - Penalties for falls (e.g., score multiplier reduction).
- **Game Modes:**
  - **Single Player - Score Attack:** Skate through procedurally generated levels to achieve the highest score.
  - **Multiplayer - Battle Mode (Planned):** Compete in real-time with other players.
  - **Multiplayer - Trick Challenge (Planned):** Take turns performing tricks with AI-judged scoring.
- **AI Events:**
  - Dynamic obstacles (e.g., dogs, car doors, puddles).
  - Timed challenges (e.g., "grind this rail").
  - Optional cop chases or rival taunts.

## Screenshots

Here’s a glimpse of **AI Street Skate Battle** in action:

![Gameplay Demo](https://raw.githubusercontent.com/Muhammad-ali234/street-skate-ai-game/main/assets/gameplay.gif)

## Installation

### Prerequisites
- A modern web browser (Chrome, Firefox, Edge, etc.)
- [Node.js](https://nodejs.org/) (for local development or running a server)
- A local server (e.g., Live Server extension in VS Code or Python’s HTTP server)

### Setup
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Muhammad-ali234/street-skate-ai-game.git
   cd ai-street-skate-battle
   ```

2. **Install Dependencies (if applicable):**
   - This project uses vanilla JavaScript and Three.js, loaded via CDNs in `index.html`. No additional dependencies are required for basic setup.
   - If you add a `package.json` for development (e.g., for a local server), run:
     ```bash
     npm install
     ```

3. **Run the Game:**
   - Use a local server to avoid CORS issues with assets:
     - **With Live Server (VS Code Extension):**
       - Open the project in VS Code.
       - Right-click `index.html` → "Open with Live Server" (default: `http://127.0.0.1:5500`).
     - **With Python HTTP Server:**
       ```bash
       python -m http.server 8000
       ```
       - Open `http://localhost:8000` in your browser.
   - The game should load in your browser.

### Controls
- **WASD:** Move (forward, backward, left, right)
- **Space:** Jump
- **Shift:** Grind (when near a rail)
- **E:** Perform an ollie
- **M:** Toggle sound
- **R:** Restart (after game over)

## AI Contributions

This project was built with the help of several AI tools, which assisted in coding, debugging, and design:

- **Gemini (Google):** Used for brainstorming game mechanics and generating initial code snippets for Three.js.
- **Claude 3.5 (Anthropic):** Assisted with refining the Game Design Document and providing suggestions for AI event logic.
- **Cursor:** Helped with real-time code editing and suggestions within the IDE.
- **xAI's Grok (Me!):** Provided debugging support, code refactoring, and generated this README.

### Sample Prompts Used

#### For Gemini (Google)
- **Prompt:** "Generate a Three.js code snippet to create a 3D skateboard model with a deck, wheels, and trucks."
  - Used to create the initial player model in `game.js`.
- **Prompt:** "Suggest dynamic AI events for a skateboarding game with procedurally generated obstacles."
  - Helped design the AI events like dogs, car doors, and timed challenges.

#### For Claude 3.5 (Anthropic)
- **Prompt:** "Review this Game Design Document for a skateboarding game and suggest improvements for AI event generation and scoring mechanics."
  - Claude provided feedback on context-aware event placement and scoring bonuses.
- **Prompt:** "Write a weighted random algorithm in JavaScript to spawn obstacles in a game based on difficulty levels."
  - Used to plan the AI event generation logic (though implemented manually later).

#### For Cursor
- **Prompt (In-Editor):** "Complete this Three.js function to spawn obstacles like traffic cones and trash cans with random positions."
  - Cursor auto-completed parts of the `createObstacle()` function in `game.js`.
- **Prompt (In-Editor):** "Add particle effects to this Three.js game when the player jumps or grinds."
  - Assisted in implementing the `setupParticleSystems()` and `updateParticleEffects()` functions.

#### For xAI's Grok
- **Prompt:** "Debug this Three.js game code: I’m getting an error 'Identifier audioListener has already been declared' in game.js."
  - I helped fix the re-declaration issue in `game.js`.
- **Prompt:** "Refactor this game.js file to optimize collision detection and improve performance."
  - I optimized collision detection using bounding boxes and streamlined the player creation process.

## Technology Stack

- **Client-Side:**
  - **3D Rendering:** Three.js (via CDN)
  - **Programming Language:** Vanilla JavaScript
  - **Networking (Planned):** WebSocket API for multiplayer
- **Server-Side (Planned):**
  - **Backend:** Node.js
  - **WebSocket Library:** `ws`
  - **Physics (Optional):** Cannon.js
- **Assets:**
  - Textures and audio files are loaded from external CDNs (e.g., Three.js examples, FreeSound, Pixabay).

## Future Plans

- **Expanded Features:**
  - Add more tricks (kickflips, heelflips, etc.).
  - Introduce new environments (parks, plazas, industrial areas).
  - Implement multiplayer modes (Battle Mode, Trick Challenge).
- **Enhancements:**
  - Add a replay system to save and share runs.
  - Explore mobile ports using Cordova or Capacitor.
- **Monetization (Optional):**
  - Cosmetic items (skins, decals) via in-game currency.
  - Rewarded video ads for extra currency or continues.

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature`).
3. Commit your changes (`git commit -m "Add your feature"`).
4. Push to the branch (`git push origin feature/your-feature`).
5. Open a Pull Request.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md) (to be added).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- **Lead Designer & Developer:** [Your Name]
- **AI Assistants:**
  - Gemini (Google)
  - Claude 3.5 (Anthropic)
  - Cursor
  - xAI's Grok
- **Assets:** Three.js example textures, FreeSound audio, Pixabay music

---

🎉 **Boom!** Skate, trick, and battle your way through the streets with AI Street Skate Battle!