# Skill Platform

A modern web application for skill exchange and learning built with Next.js 14, TypeScript, Tailwind CSS, and shadcn/ui. The platform allows users to connect with others to exchange skills and knowledge through a beautiful, glassmorphic UI.

## Features

- 🎨 Modern SaaS/Glassmorphic Design
- 🌙 Dark/Light Mode Support
- 🔐 User Authentication
- 👤 User Profiles
- 🔄 Skill Swapping System
- 📊 Dashboard
- 🎯 Skill Matching
- 💬 Request Management

## Tech Stack

- [Next.js 14](https://nextjs.org/) - React Framework
- [TypeScript](https://www.typescriptlang.org/) - Type Safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI Components
- [Lucide Icons](https://lucide.dev/) - Icons
- [next-themes](https://github.com/pacocoursey/next-themes) - Theme Management

## Prerequisites

Make sure you have the following installed:

- Node.js (v18 or higher)
- npm or pnpm (we recommend pnpm)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/skill_platform.git
cd skill_platform
```

2. Install dependencies:
```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install
```

3. Run the development server:
```bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Project Structure

```
skill_platform/
├── app/                     # Next.js app directory
│   ├── dashboard/          # Dashboard pages
│   ├── login/             # Authentication pages
│   ├── profile/          # Profile pages
│   ├── request/          # Skill request pages
│   ├── globals.css      # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx       # Home page
├── components/          # React components
│   ├── ui/            # shadcn/ui components
│   └── ...           # Custom components
├── lib/               # Utility functions
├── public/           # Static files
└── styles/          # Additional styles
```

## Key Components

- `Navbar`: Main navigation component with theme switching
- `AuthProvider`: Handles user authentication state
- `ThemeProvider`: Manages light/dark theme
- `SkillInput`: Custom component for skill selection
- `ImageUpload`: Handles profile image uploads

## Styling

The project uses a combination of Tailwind CSS and custom CSS for styling:

- Modern gradients and glassmorphism effects
- Responsive design
- Dark mode support
- Custom animations and transitions

### Color Scheme

The application uses a professional color scheme with blue and violet gradients:

- Primary gradient: `from-blue-600 to-violet-600`
- Dark mode gradient: `dark:from-blue-400 dark:to-violet-400`
- Background effects: `bg-grid-white/10` with radial gradients
- Glassmorphism: `backdrop-blur-md` with semi-transparent backgrounds

## Development

### Adding New Pages

1. Create a new directory in the `app` directory
2. Add a `page.tsx` file with your component
3. Use the existing components and styles for consistency

### Adding New Components

1. Create a new file in `components` directory
2. Follow the existing component patterns
3. Use shadcn/ui components when possible
4. Maintain the glassmorphic design system

## Contributing

1. Fork the repository
2. Create a new branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.
