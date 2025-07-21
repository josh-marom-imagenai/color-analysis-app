# Color Analysis Viewer

A modern React application for analyzing and visualizing color usage patterns in your codebase. Built with Vite, TypeScript, Mantine UI, and TanStack technologies.

## Features

- 📊 **Dashboard**: Overview statistics and charts
- 🎨 **Color Palette**: Interactive color grid with search and filtering
- 📈 **Usage Analysis**: Detailed file and context analysis
- 🌈 **Color Wheel**: Hue distribution and harmony analysis
- ⚠️ **Conflicts Analysis**: Duplicate detection and design system coverage

## Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Mantine
- **Charts**: Chart.js with react-chartjs-2
- **Color Utils**: colord
- **Utilities**: radashi, type-fest
- **Icons**: Tabler Icons

## Development

### Prerequisites

- Node.js 18.18.0+ or 20.9.0+
- npm or yarn

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:5173 in your browser
```

### Available Scripts

#### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting without changes
- `npm run type-check` - Run TypeScript type checking
- `npm run check` - Run all checks (formatting, linting, type-checking)
- `npm run fix` - Auto-fix formatting and linting issues

#### Recommended Workflow

```bash
# Before committing changes
npm run check

# Auto-fix common issues
npm run fix
```

### Code Style

This project uses:

- **Prettier** for code formatting
- **ESLint** for code linting and quality
- **TypeScript** for type safety

VS Code users will get automatic formatting on save with the included workspace settings.

## Usage

1. **Load Data**: Upload a color-analysis.json file using the file upload area
2. **Explore Dashboard**: View overall statistics and distribution charts
3. **Browse Palette**: Search and filter colors by category, hue, or usage
4. **Analyze Usage**: Review file-by-file color usage patterns
5. **Check Harmony**: Visualize color relationships on the color wheel
6. **Review Conflicts**: Identify duplicates and design system coverage issues

## Project Structure

```
src/
├── components/          # React components
│   ├── Dashboard.tsx    # Main dashboard with stats and charts
│   ├── ColorPalette.tsx # Color grid with search/filter
│   ├── UsageAnalysis.tsx # File and usage analysis
│   ├── ColorWheel.tsx   # Hue distribution visualization
│   ├── ConflictsAnalysis.tsx # Duplicate detection and coverage
│   └── FileUpload.tsx   # JSON file upload component
├── types/
│   └── color.ts         # TypeScript type definitions
├── utils/
│   └── colorUtils.ts    # Color manipulation and analysis utilities
├── App.tsx              # Main application component
└── main.tsx             # Application entry point
```

## Contributing

1. Ensure code quality: `npm run check`
2. Fix issues automatically: `npm run fix`
3. Follow the TypeScript and React best practices
4. Use semantic commit messages
