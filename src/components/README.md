# Card Component

A versatile card component with three variants, designed to match the Kynd.no design system.

## Features

- **Three variants**: Default, Green, and Black
- **Background patterns**: Uses SVG patterns for visual interest
- **Responsive design**: Adapts to different screen sizes
- **Accessible**: Proper semantic HTML and ARIA support
- **Customizable**: Configurable content and styling

## Variants

### Default Variant

- Light gray background (`#F3F3F3`)
- Pattern 1 background
- Green accent color for labels and link circle
- Dark blue text

### Green Variant

- Green background (`#B9FF66`)
- Pattern 2 background
- White labels and link circle
- Dark blue text

### Black Variant

- Dark blue background (`#1E292B`)
- Pattern 2 background
- White text and accents
- Green accent color for labels

## Usage

```astro
---
import Card from '@/components/Card.astro';
---

<!-- Default variant -->
<Card
  heading="Fullstack"
  subheading="Softwareutvikling"
  linkText="Learn more"
  linkHref="/services/fullstack"
/>

<!-- Green variant -->
<Card
  variant="green"
  heading="Design"
  subheading="UX/UI"
  linkText="Learn more"
  linkHref="/services/design"
/>

<!-- Black variant -->
<Card
  variant="black"
  heading="Strategy"
  subheading="Digital"
  linkText="Learn more"
  linkHref="/services/strategy"
/>

<!-- Without illustration -->
<Card variant="default" heading="Simple Card" illustration={false} />
```

## Props

| Prop           | Type                              | Default        | Description                      |
| -------------- | --------------------------------- | -------------- | -------------------------------- |
| `variant`      | `'default' \| 'green' \| 'black'` | `'default'`    | Card variant style               |
| `heading`      | `string`                          | **required**   | Main heading text                |
| `subheading`   | `string`                          | `undefined`    | Secondary heading text           |
| `linkText`     | `string`                          | `'Learn more'` | Link button text                 |
| `linkHref`     | `string`                          | `'#'`          | Link destination URL             |
| `illustration` | `boolean`                         | `true`         | Whether to show the illustration |
| `class`        | `string`                          | `undefined`    | Additional CSS classes           |

## Styling

The component uses CSS custom properties for colors and follows the Kynd design system:

- **Typography**: Space Grotesk for headings, Inter for body text
- **Colors**: Uses CSS variables from `variables.css`
- **Spacing**: Consistent with design system spacing
- **Shadows**: Subtle drop shadow for depth
- **Borders**: 2px border with rounded corners

## Responsive Behavior

- **Desktop**: Horizontal layout with content and illustration side by side
- **Mobile**: Vertical layout with stacked content and illustration
- **Breakpoint**: Changes at 48em (768px)

## Dependencies

- `@/styles/variables.css` - Color and spacing variables
- `@/styles/main.css` - Base styles and animations
- Google Fonts: Space Grotesk and Inter

## Examples

See `/card-demo` page for live examples of all variants.
