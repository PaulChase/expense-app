# Expense Tracker App - AI Coding Instructions

## Architecture Overview

This is a React Native (Expo) personal finance app using **SQLite for local storage**, **NativeWind for styling**, and **AsyncStorage for user preferences**. The app tracks income/expenses with category-based budgeting and provides calendar-based transaction views.

## Key Data Flow Patterns

### SQLite Database Schema

- **Single table**: `transactions (id, amount, type, category, date)`
- **Database initialization**: Always happens in `HomeScreen.tsx` at module level before component export
- **Transaction pattern**: Use `db.transaction()` with `db.exec([{sql, args}])` format
- **Query results**: Access via `results[0].rows` array

### State Management Architecture

- **Local state only** - no global state management
- **AsyncStorage for persistence**: `balance`, `categories`, `onboardingShown`
- **SQLite for transactions**: All financial data stored locally
- **Real-time updates**: Use `useEffect` to sync AsyncStorage with component state

## Critical Development Workflows

### Running the App

```bash
expo start              # Development server
expo start --android    # Android emulator
expo start --ios        # iOS simulator
```

### Building for Distribution

```bash
npm run build:dev       # Development build with dev client
npm run build:preview   # APK for testing
npm run build:prod      # Production build
```

## Project-Specific Conventions

### Styling Patterns

- **NativeWind Tailwind classes**: Use `className` instead of `style` props
- **Consistent card styling**: `bg-white border-l-4 border-[color]-700 rounded-md p-3`
- **Color coding**: Green for income, red for expenses, blue for balance/neutral
- **Floating action buttons**: Positioned absolutely with `elevation: 10` for Android shadow

### Modal Component Pattern

All modals follow this structure:

```tsx
// Located in app/Components/Modals/
// Props: showModal, closeModal, and specific action handler
// Animated slide modal with dark overlay (bg-black/80)
// Close button: Ionicons "close-circle-outline" in top-right
```

### Database Operations

- **Always use transactions** for data consistency
- **Error handling**: First parameter in transaction callback
- **Success callback**: Third parameter for post-transaction updates
- **State updates**: Update local state immediately after successful DB operation

### Category Management

- **Default categories**: Defined in `DEFAULT_CATEGORIES` constant in `HomeScreen.tsx`
- **Dynamic categories**: User can add via `AddCategoryModal`, stored in AsyncStorage
- **Category sorting**: Alphabetical in selectors, by spending amount in lists

## Navigation Structure

- **Bottom tab navigation**: Home (transactions), Bills (categories), Calendar (daily view)
- **Modal navigation**: All data entry through modal overlays, not screen navigation
- **Tab icons**: Ionicons for Home, AntDesign for Bills, Entypo for Calendar

## Financial Logic Patterns

### Balance Validation

- **Expense validation**: Prevent spending more than current balance
- **Balance updates**: Subtract expenses, add income immediately
- **Runway calculation**: `balance / daysLeftInMonth` for daily spending limit

### Monthly Calculations

Use SQLite date functions for current month filtering:

```sql
strftime('%Y-%m', date) = strftime('%Y-%m', 'now')
```

## Integration Points

- **expo-sqlite**: Local database, no backend dependency
- **react-native-toast-message**: Success/error notifications, requires `<Toast />` in App.tsx
- **react-native-modal-selector**: Category selection in expense modal
- **react-native-calendars**: Date marking and selection for transaction history
- **moment.js**: Date manipulation and formatting

## Development Gotchas

- **Database timing**: Always initialize DB schema before any queries
- **AsyncStorage sync**: State changes trigger automatic AsyncStorage updates via useEffect
- **Modal state**: Each modal manages its own form state, resets on close
- **Refresh patterns**: Pull-to-refresh re-fetches data and recalculates derived values
- **TypeScript**: Interfaces defined in `app/utils/types.tsx`, helpers in `app/utils/helpers.tsx`

## Testing Patterns

- **Manual testing**: Use expo development build for device testing
- **Database testing**: Check SQLite operations in development builds
- **State persistence**: Test AsyncStorage by force-closing and reopening app
