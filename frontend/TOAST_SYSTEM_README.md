# Modern Toast Notification System

This project now uses a modern, beautiful toast notification system instead of the default browser `alert()` popups. The toast system provides a much better user experience with smooth animations, different types of notifications, and customizable durations.

## Features

- **4 Types of Notifications**: Success, Error, Warning, and Info
- **Smooth Animations**: Slide-in from right with fade effects
- **Auto-dismiss**: Configurable duration (default: 5 seconds)
- **Manual Dismiss**: Click the X button to close manually
- **Progress Bar**: Visual indicator showing time remaining
- **Multiple Toasts**: Stack multiple notifications
- **Responsive Design**: Works on all screen sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation

## Usage

### Basic Usage

```tsx
import { useToast } from '../contexts/ToastContext';

const MyComponent = () => {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const handleSuccess = () => {
    showSuccess('Success!', 'Operation completed successfully');
  };

  const handleError = () => {
    showError('Error!', 'Something went wrong');
  };

  const handleWarning = () => {
    showWarning('Warning!', 'Please check your input');
  };

  const handleInfo = () => {
    showInfo('Info', 'Here is some information');
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleWarning}>Show Warning</button>
      <button onClick={handleInfo}>Show Info</button>
    </div>
  );
};
```

### Advanced Usage

```tsx
// Custom duration (in milliseconds)
showSuccess('Long Message', 'This will stay for 10 seconds', 10000);

// No auto-dismiss
showInfo('Important', 'This will not auto-close', 0);

// Title only (no message)
showSuccess('Operation Complete');

// Multiple toasts in sequence
const showMultipleToasts = () => {
  showSuccess('First', 'First notification');
  setTimeout(() => showInfo('Second', 'Second notification'), 500);
  setTimeout(() => showWarning('Third', 'Third notification'), 1000);
};
```

## API Reference

### Toast Types

- `showSuccess(title: string, message?: string, duration?: number)`
- `showError(title: string, message?: string, duration?: number)`
- `showWarning(title: string, message?: string, duration?: number)`
- `showInfo(title: string, message?: string, duration?: number)`
- `showToast(type: ToastType, title: string, message?: string, duration?: number)`

### Parameters

- `title` (required): The main heading of the toast
- `message` (optional): Additional descriptive text
- `duration` (optional): Time in milliseconds before auto-dismiss (default: 5000ms, 0 = no auto-dismiss)

### Toast Types

```tsx
type ToastType = 'success' | 'error' | 'warning' | 'info';
```

## Components

### Toast Component
Located at `src/components/ui/Toast.tsx`
- Individual toast notification
- Handles animations and styling
- Progress bar for duration

### ToastContainer Component
Located at `src/components/ui/ToastContainer.tsx`
- Manages multiple toasts
- Positioned at top-right of screen
- Handles toast stacking

### ToastContext
Located at `src/contexts/ToastContext.tsx`
- Global state management
- Provides toast methods to all components
- Handles toast lifecycle

## Styling

The toast system uses Tailwind CSS classes and includes:

- **Color-coded types**: Green (success), Red (error), Yellow (warning), Blue (info)
- **Smooth transitions**: 300ms animations for all state changes
- **Shadow and borders**: Modern card-like appearance
- **Responsive design**: Adapts to different screen sizes
- **Icon integration**: Uses Heroicons for visual consistency

## Migration from alert()

All `alert()` calls have been replaced with appropriate toast notifications:

```tsx
// Before (old way)
alert('User created successfully');

// After (new way)
showSuccess('User Created', 'User has been created successfully');
```

## Examples in the Codebase

The toast system is now used throughout the application:

- **Users.tsx**: User creation, updates, and deletion
- **Students.tsx**: Student management operations
- **Sections.tsx**: Section CRUD operations
- **Classes.tsx**: Class CRUD operations
- **SessionSelector.tsx**: Session switching feedback
- **StudentAdmission.tsx**: Student admission success
- **Dashboard.tsx**: Error handling and system feedback

## Testing

You can test the toast system using the demo component on the Dashboard page. It includes buttons for all toast types and various configurations.

## Customization

To customize the toast system:

1. **Colors**: Modify the `getTypeStyles()` function in `Toast.tsx`
2. **Position**: Change the positioning in `ToastContainer.tsx`
3. **Duration**: Adjust default duration in `ToastContext.tsx`
4. **Animations**: Modify transition classes in `Toast.tsx`

## Browser Support

The toast system works in all modern browsers and includes:
- CSS transitions and transforms
- ES6+ JavaScript features
- Responsive design principles
- Accessibility features

## Performance

- Lightweight implementation
- Efficient state management
- Minimal DOM manipulation
- Optimized animations
- Memory leak prevention with proper cleanup
