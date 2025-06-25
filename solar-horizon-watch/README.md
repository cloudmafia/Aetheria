# Aetheria - Solar Horizon Watch

Solar Horizon Watch is an advanced space weather monitoring dashboard that provides real-time data visualization and tracking of solar activity. This application helps users monitor solar events like CMEs, solar flares, and their potential impacts on Earth.

[![Solar Horizon Watch](https://img.shields.io/badge/Aetheria-Solar%20Horizon%20Watch-blue)](https://github.com/cloudmafia/Aetheria)

## Features

- **Real-time Solar Data**: Monitor current solar activity including flares, CMEs, and solar wind data
- **Satellite Tracking**: Live tracking of satellites using real-time TLE data from CelesTrak
- **Space Weather Alerts**: Get notified about major space weather events that might impact Earth
- **Interactive 3D Visualizations**: View Earth's geomagnetic field and satellite positions
- **Historical Data Analysis**: Compare current conditions with historical solar events
- **Responsive Design**: Works on desktop and mobile devices

## How can I edit this code?

There are several ways of editing your application.

**Use GitHub**

Clone this repository and make changes locally, then push to GitHub.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Technologies Used

This project is built with modern web technologies:

- **Vite**: Fast build tooling and development server
- **TypeScript**: Type-safe JavaScript for enhanced developer experience
- **React 18**: Component-based UI library with hooks
- **React Query**: Data fetching and state management
- **Three.js**: 3D visualizations for satellite tracking
- **Satellite.js**: Satellite position calculations using SGP4
- **shadcn/ui**: Accessible UI components
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Lucide React**: Beautiful icon set

## API Integrations

The application integrates with several public space weather APIs:

- **NOAA SWPC JSON APIs**: Current space weather conditions and alerts
- **NASA APIs**: Solar imagery and event data
- **CelesTrak**: Satellite TLE (Two-Line Element) data

## How to Run Locally

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn

### Installation

```sh
# Clone the repository
git clone https://github.com/cloudmafia/Aetheria.git

# Navigate to the project directory
cd Aetheria/solar-horizon-watch

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Building for Production

```sh
# Create an optimized production build
npm run build

# Preview the production build locally
npm run preview
```

## Deployment Options

This Vite-based React application can be easily deployed to various hosting platforms:

### Netlify

1. Connect your GitHub repository to Netlify
2. Set build command to `npm run build`
3. Set publish directory to `dist`
4. Configure environment variables as needed

### Vercel

1. Import your project from GitHub
2. Vercel will automatically detect Vite and configure the build settings
3. Deploy and get a preview URL instantly

### GitHub Pages

Update the `vite.config.ts` file to include your base path:

```ts
export default defineConfig({
  base: '/Aetheria/', // Use your repository name here
  // other config
});
```

Then use the following deploy script:

```sh
npm run build
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

## Environment Variables

No environment variables are required as all APIs used are public. However, you may want to configure the following in a `.env` file for custom deployments:

```
VITE_APP_CORS_PROXY=https://your-cors-proxy.com/
```

## Can I connect a custom domain to this project?

Yes, you can! Follow your hosting platform's instructions for connecting a custom domain.
