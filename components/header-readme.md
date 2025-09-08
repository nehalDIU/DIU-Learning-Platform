# Header Component

A reusable header component for the DIU Learning Platform that provides consistent navigation and branding across the application.

## Features

- **Responsive Design**: Adapts to mobile and desktop layouts
- **Theme Toggle**: Built-in dark/light mode switching
- **Navigation Menu**: Primary navigation with active states
- **Mobile Menu**: Collapsible navigation for mobile devices
- **Notifications**: Bell icon with notification badge
- **Profile Access**: User profile icon
- **DIU Branding**: University logo and branding

## Usage

### Basic Usage

```tsx
import { Header } from "@/components/header"

export default function MyPage() {
  return (
    <div>
      <Header />
      {/* Your page content */}
    </div>
  )
}
```

### With Custom Styling

```tsx
import { Header } from "@/components/header"

export default function MyPage() {
  return (
    <div>
      <Header className="border-b-2 border-primary" />
      {/* Your page content */}
    </div>
  )
}
```

## Navigation Items

The header includes the following navigation items:

- **Home**: Main landing page (/)
- **Notes**: Course notes and materials (/notes)
- **Courses**: Course browsing and enrollment (/courses)
- **Contributor**: Contributors and team information (highlighted as primary) (/contributor)
- **Result**: Academic results (/result)

## Customization

### Modifying Navigation Items

To modify the navigation items, edit the `navigationItems` array in `components/header.tsx`:

```tsx
const navigationItems = [
  { name: "Home", href: "/", primary: false },
  { name: "Notes", href: "/notes", primary: false },
  { name: "Courses", href: "/courses", primary: false },
  { name: "Contributor", href: "/contributor", primary: true },
  { name: "Result", href: "/result", primary: false },
  // Add your custom items here
]
```

### Logo Customization

The header uses the DIU logo from `/images/diu-logo.png`. If the image fails to load, it falls back to a "DIU" text display.

## Responsive Behavior

- **Desktop (lg+)**: Full navigation menu visible in center
- **Mobile**: Navigation menu collapses into hamburger menu
- **Logo**: Responsive sizing (smaller on mobile)
- **Subtitle**: Hidden on small screens

## Theme Integration

The header integrates with the `next-themes` package for theme switching:

- Uses theme-aware styling with CSS variables
- Provides theme toggle button
- Maintains theme state across page navigation

## Dependencies

- `next/navigation` - For routing
- `next-themes` - For theme management
- `lucide-react` - For icons
- `@/components/ui/button` - Button component
- `@/lib/utils` - Utility functions (cn)

## Accessibility

- Proper ARIA labels and screen reader support
- Keyboard navigation support
- Focus management for mobile menu
- Semantic HTML structure

## Browser Support

Compatible with all modern browsers that support:
- CSS Grid and Flexbox
- CSS Custom Properties (CSS Variables)
- ES6+ JavaScript features
