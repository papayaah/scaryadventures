## Scary Adventures - Interactive Counter Game

A Reddit-native interactive counter game built with React and Devvit that creates a persistent, community-driven experience.

### What This Game Is

Scary Adventures is a simple yet engaging counter game that runs directly within Reddit posts. Players can increment or decrement a shared counter that persists across all users and sessions. The game features a clean, mobile-friendly interface with Reddit's signature Snoo mascot and provides a foundation for building more complex interactive experiences on the Reddit platform.

### What Makes This Game Innovative

- **Reddit-Native Experience**: Runs directly within Reddit posts without requiring external websites or downloads
- **Persistent State**: Counter values are stored in Redis and persist across all users and sessions
- **Community-Driven**: All players interact with the same shared counter, creating a collaborative experience
- **Cross-Platform**: Works seamlessly on both desktop and mobile Reddit
- **Real-Time Updates**: Changes are immediately reflected through server-side state management
- **Zero Setup**: Players can start interacting immediately without accounts or installations

### Technology Stack

- [Devvit](https://developers.reddit.com/): Reddit's developer platform for building native apps
- [React](https://react.dev/): Frontend UI framework
- [Express](https://expressjs.com/): Backend API server
- [Redis](https://redis.io/): Persistent data storage
- [Vite](https://vite.dev/): Build tool and development server
- [Tailwind CSS](https://tailwindcss.com/): Styling framework
- [TypeScript](https://www.typescriptlang.org/): Type safety and development experience

## Getting Started

> Make sure you have Node 22 downloaded on your machine before running!

1. Run `npm create devvit@latest --template=react`
2. Go through the installation wizard. You will need to create a Reddit account and connect it to Reddit developers
3. Copy the command on the success page into your terminal

## Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit.
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app

## Cursor Integration

This template comes with a pre-configured cursor environment. To get started, [download cursor](https://www.cursor.com/downloads) and enable the `devvit-mcp` when prompted.
