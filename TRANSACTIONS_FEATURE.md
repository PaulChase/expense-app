# Transactions Screen Feature

## Overview

A dedicated transactions screen that displays all transactions organized by month with filtering capabilities and CSV export functionality.

## Features

### 1. Monthly Transaction Filtering

- **Year Filter**: Dropdown to select from years that have transactions
- **Month Filter**: Dropdown to select from months that have transactions for the selected year
- **Smart Defaults**: Automatically selects current month/year if available, otherwise the most recent month with transactions

### 2. Transaction Display

- **Monthly Summary Cards**: Shows total income, expenses, and net amount for the selected month
- **Transaction List**: Displays all transactions for the selected month with dates
- **Empty States**: Helpful messages when no transactions exist or no month is selected

### 3. CSV Export

- **One-click Export**: Export transactions for the current month to CSV format
- **Comprehensive Data**: Includes date, type, category, amount, and description
- **Native Sharing**: Uses platform sharing capabilities to save or share the CSV file
- **Smart Filename**: Automatically names files as `transactions_[Month]_[Year].csv`

### 4. User Experience

- **Pull-to-Refresh**: Refresh transaction data and filters
- **Responsive Design**: Works well on different screen sizes
- **Loading States**: Visual feedback during export operations
- **Toast Notifications**: Success/error messages for user actions

## Navigation

The Transactions screen is accessible via the bottom tab navigation with a receipt icon.

## Data Structure

The screen uses the existing SQLite database with the `transactions` table:

- `id`: Transaction ID
- `amount`: Transaction amount
- `type`: 'income' or 'expense'
- `category`: Transaction category
- `date`: Transaction date
- `description`: Optional description

## Technical Implementation

### Dependencies Added

- `expo-file-system`: For creating and managing CSV files
- `expo-sharing`: For sharing exported files

### Key Components

- **Filter Dropdowns**: Year and month selectors with dynamic options
- **Summary Cards**: Color-coded cards showing financial summary
- **Export Button**: Handles CSV generation and sharing
- **Empty States**: Different states for no transactions vs. no selection

### Performance Optimizations

- **Conditional Rendering**: Only shows filters when transactions exist
- **Efficient Queries**: Uses SQLite date functions for filtering
- **Memory Management**: Proper state cleanup and async operations

## Usage Example

1. Navigate to the "Transactions" tab
2. Select a year from the year dropdown (only years with transactions appear)
3. Select a month from the month dropdown (only months with transactions appear)
4. View the summary cards and transaction list
5. Tap "Export CSV" to export the current month's transactions
6. Share or save the generated CSV file

## File Organization

```
app/
├── Screens/
│   ├── TransactionsScreen.tsx      # Main transactions screen component
│   └── ...
├── Components/
│   ├── TransactionItem.tsx         # Updated to support showDate prop
│   └── ...
└── ...
```

## Future Enhancements

Potential improvements for this feature:

1. **Date Range Selection**: Allow custom date ranges instead of just monthly
2. **Multiple Export Formats**: Support for Excel, PDF, or other formats
3. **Advanced Filters**: Filter by category, amount range, or transaction type
4. **Search Functionality**: Search transactions by description or category
5. **Data Visualization**: Charts and graphs for monthly trends
