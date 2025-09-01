# Income Category Feature Documentation

## Overview

Added the ability for users to categorize their income records, similar to how expense categorization works. This provides better organization and tracking of different income sources.

## New Features

### 1. Income Categories

- **Separate Category Set**: Income uses its own set of categories, different from expense categories
- **Default Income Categories**:
  - Salary
  - Freelance
  - Business
  - Investments
  - Rental Income
  - Bonus
  - Gifts
  - Side Hustle
  - Refunds
  - Other Income

### 2. Enhanced Income Modal

- **Category Selector**: Added a modal selector for choosing income categories
- **Optional Selection**: Category selection is optional - users can still record income without a category
- **Consistent UI**: Uses the same design pattern as the expense modal for consistency

### 3. Database Updates

- **Category Storage**: Income categories are stored in the transactions table under the `category` field
- **Backward Compatibility**: Existing income records without categories will continue to work
- **Separate Storage**: Income categories are stored separately in AsyncStorage under `incomeCategories`

## Technical Implementation

### Files Modified

#### 1. `app/utils/types.tsx`

```typescript
export interface AddIncomeProps {
	amount: string;
	category?: string; // Added optional category field
}
```

#### 2. `app/Components/Modals/AddIncomeModal.tsx`

- Added category selection using `ModalSelector`
- Added category state management
- Updated modal to include category field
- Made category selection optional
- Added form reset on close

#### 3. `app/Screens/HomeScreen.tsx`

- Added `DEFAULT_INCOME_CATEGORIES` constant
- Added `incomeCategories` state
- Added income category storage management
- Updated `handleAddIncome` to save category data
- Updated database insert to include category
- Updated refresh function to reload income categories

### Key Code Changes

#### Database Insert (HomeScreen.tsx)

```typescript
const result = await database.runAsync("INSERT INTO transactions (amount, type, category, date) VALUES (?, ?, ?, ?)", [
	parseInt(income.amount),
	"income",
	income.category || null,
	new Date().toISOString().split("T")[0],
]);
```

#### Modal Usage (HomeScreen.tsx)

```typescript
<AddIncomeModal
	showModal={showAddIncomeModal}
	closeModal={toggleAddIncomeModal}
	addIncome={handleAddIncome}
	categories={incomeCategories}
/>
```

## User Experience

### Before

- Users could only record income amount
- No way to categorize different income sources
- Limited tracking capabilities for income analysis

### After

- Users can optionally categorize their income
- Better organization of income sources
- Consistent experience with expense recording
- Same design patterns for familiar user experience

## Data Management

### Storage Keys

- **Expense Categories**: `categories` (existing)
- **Income Categories**: `incomeCategories` (new)

### Database Schema

```sql
CREATE TABLE IF NOT EXISTS transactions (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	amount FLOAT NOT NULL,
	type VARCHAR(255) NOT NULL,
	category VARCHAR(255), -- Now used for both income and expense
	date DATETIME NOT NULL
)
```

## Future Enhancements

### Potential Improvements

1. **Custom Income Categories**: Allow users to add custom income categories
2. **Category Analytics**: Show income breakdown by category
3. **Category Icons**: Add visual icons for different income categories
4. **Category Goals**: Set income targets per category
5. **Category Filtering**: Filter transactions by income category

### Migration Considerations

- Existing income records without categories will display properly
- Users will see the new category field immediately
- No data migration required
- Backward compatible with older app versions

## Testing Checklist

- [x] Income modal opens with category selector
- [x] Category selection works properly
- [x] Income can be saved with category
- [x] Income can be saved without category (optional)
- [x] Categories persist in AsyncStorage
- [x] Database correctly stores category data
- [x] Refresh functionality works
- [x] No compilation errors
- [x] UI consistency with expense modal
- [x] Form resets properly on close

## Benefits

1. **Better Organization**: Users can track different income sources
2. **Consistent UX**: Same interaction pattern as expenses
3. **Optional Feature**: Doesn't disrupt existing workflow
4. **Future-Ready**: Foundation for income analytics features
5. **Clean Architecture**: Separate storage for income vs expense categories
