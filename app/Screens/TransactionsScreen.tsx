import React, { useEffect, useState } from "react";
import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl, Alert, Platform } from "react-native";
import * as SQLite from "expo-sqlite";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import TransactionItem from "../Components/TransactionItem";
import DeleteConfirmationModal from "../Components/Modals/DeleteConfirmationModal";
import { EachTransactionItem } from "../utils/types";
import moment from "moment";
import Toast from "react-native-toast-message";

interface MonthlyData {
	month: string;
	year: string;
	transactions: EachTransactionItem[];
	totalIncome: number;
	totalExpense: number;
	netAmount: number;
}

interface MonthFilter {
	month: number;
	year: number;
	label: string;
}

// Initialize database
let db: SQLite.SQLiteDatabase | null = null;

const initDatabase = async () => {
	if (!db) {
		db = await SQLite.openDatabaseAsync("data.db");
	}
	return db;
};

export default function TransactionsScreen() {
	const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
	const [availableMonths, setAvailableMonths] = useState<MonthFilter[]>([]);
	const [selectedMonth, setSelectedMonth] = useState<MonthFilter | null>(null);
	const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
	const [availableYears, setAvailableYears] = useState<number[]>([]);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [showMonthSelector, setShowMonthSelector] = useState(false);
	const [showYearSelector, setShowYearSelector] = useState(false);
	const [isExporting, setIsExporting] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [transactionToDelete, setTransactionToDelete] = useState<EachTransactionItem | null>(null);

	// Get all available years with transactions
	const getAvailableYears = async () => {
		try {
			const database = await initDatabase();
			const result = await database.getAllAsync(
				"SELECT DISTINCT strftime('%Y', date) as year FROM transactions ORDER BY year DESC"
			);

			const years = result.map((row: any) => parseInt(row.year));
			setAvailableYears(years);

			// If no years available, reset state
			if (years.length === 0) {
				setSelectedYear(new Date().getFullYear());
				setAvailableMonths([]);
				setSelectedMonth(null);
				setMonthlyData([]);
				return;
			}

			// Set current year as default if available, otherwise first available year
			const currentYear = new Date().getFullYear();
			const defaultYear = years.includes(currentYear) ? currentYear : years[0];
			setSelectedYear(defaultYear);
		} catch (error) {
			console.error("Error getting available years:", error);
		}
	};

	// Get all available months for selected year
	const getAvailableMonthsForYear = async (year: number) => {
		try {
			const database = await initDatabase();
			const result = await database.getAllAsync(
				"SELECT DISTINCT strftime('%m', date) as month FROM transactions WHERE strftime('%Y', date) = ? ORDER BY month DESC",
				[year.toString()]
			);

			const months = result.map((row: any) => {
				const monthNum = parseInt(row.month);
				return {
					month: monthNum,
					year: year,
					label: moment()
						.month(monthNum - 1)
						.format("MMMM"),
				};
			});

			setAvailableMonths(months);

			// If no months available for this year, reset selection
			if (months.length === 0) {
				setSelectedMonth(null);
				setMonthlyData([]);
				return;
			}

			// Set current month as default if available, otherwise first available month
			const currentMonth = new Date().getMonth() + 1;
			const currentYear = new Date().getFullYear();
			const currentMonthOption = year === currentYear ? months.find((m) => m.month === currentMonth) : null;
			setSelectedMonth(currentMonthOption || months[0]);
		} catch (error) {
			console.error("Error getting available months:", error);
		}
	};

	// Get transactions for selected month and year
	const getTransactionsForMonth = async (month: number, year: number) => {
		try {
			const database = await initDatabase();
			const result = await database.getAllAsync(
				"SELECT * FROM transactions WHERE strftime('%Y', date) = ? AND strftime('%m', date) = ? ORDER BY date DESC, id DESC",
				[year.toString(), month.toString().padStart(2, "0")]
			);

			const transactions = result as EachTransactionItem[];

			// Calculate totals
			const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);

			const totalExpense = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);

			const monthData: MonthlyData = {
				month: moment()
					.month(month - 1)
					.format("MMMM"),
				year: year.toString(),
				transactions,
				totalIncome,
				totalExpense,
				netAmount: totalIncome - totalExpense,
			};

			setMonthlyData([monthData]);
		} catch (error) {
			console.error("Error getting transactions for month:", error);
			setMonthlyData([]);
		}
	};

	// Export transactions to CSV
	const exportToCSV = async () => {
		if (!selectedMonth || monthlyData.length === 0) {
			Toast.show({
				type: "error",
				text1: "No data to export",
				text2: "Please select a month with transactions",
			});
			return;
		}

		setIsExporting(true);

		try {
			const data = monthlyData[0];
			const csvHeader = "Date,Type,Category,Amount,Description\n";

			const csvRows = data.transactions
				.map((transaction) => {
					const date = moment(transaction.date).format("YYYY-MM-DD");
					const type = transaction.type;
					const category = transaction.category || "";
					const amount = transaction.amount.toFixed(2);
					const description = (transaction.description || "").replace(/"/g, '""'); // Escape quotes

					return `"${date}","${type}","${category}","${amount}","${description}"`;
				})
				.join("\n");

			const csvContent = csvHeader + csvRows;

			// Create filename
			const filename = `transactions_${data.month}_${data.year}.csv`;
			const fileUri = FileSystem.documentDirectory + filename;

			// Write file
			await FileSystem.writeAsStringAsync(fileUri, csvContent);

			// Share file
			if (await Sharing.isAvailableAsync()) {
				await Sharing.shareAsync(fileUri, {
					mimeType: "text/csv",
					dialogTitle: "Export Transactions",
				});
			} else {
				Toast.show({
					type: "success",
					text1: "Export completed",
					text2: `File saved to ${fileUri}`,
				});
			}

			Toast.show({
				type: "success",
				text1: "Export successful",
				text2: `${data.transactions.length} transactions exported`,
			});
		} catch (error) {
			console.error("Error exporting CSV:", error);
			Toast.show({
				type: "error",
				text1: "Export failed",
				text2: "An error occurred while exporting",
			});
		} finally {
			setIsExporting(false);
		}
	};

	// Handle delete transaction
	const handleDeleteTransaction = (transaction: EachTransactionItem) => {
		setTransactionToDelete(transaction);
		setShowDeleteModal(true);
	};

	// Confirm delete transaction
	const confirmDeleteTransaction = async () => {
		if (!transactionToDelete) return;

		try {
			const database = await initDatabase();

			// Delete the transaction from database
			await database.runAsync("DELETE FROM transactions WHERE id = ?", [transactionToDelete.id]);

			// Close modal and reset state
			setShowDeleteModal(false);
			setTransactionToDelete(null);

			// Refresh the current month's data
			if (selectedMonth) {
				await getTransactionsForMonth(selectedMonth.month, selectedMonth.year);
			}

			// Refresh available years/months in case this was the last transaction
			await getAvailableYears();

			Toast.show({
				type: "success",
				text1: "Transaction deleted",
				text2: "Transaction has been removed successfully",
			});
		} catch (error) {
			console.error("Error deleting transaction:", error);
			Toast.show({
				type: "error",
				text1: "Delete failed",
				text2: "An error occurred while deleting the transaction",
			});
		}
	};

	// Close delete modal
	const closeDeleteModal = () => {
		setShowDeleteModal(false);
		setTransactionToDelete(null);
	};

	// Refresh data
	const onRefresh = async () => {
		setIsRefreshing(true);
		await getAvailableYears();
		if (selectedMonth) {
			await getTransactionsForMonth(selectedMonth.month, selectedMonth.year);
		}
		setIsRefreshing(false);
	};

	// Initial data load
	useEffect(() => {
		getAvailableYears();
	}, []);

	// Load months when year changes
	useEffect(() => {
		if (selectedYear) {
			getAvailableMonthsForYear(selectedYear);
		}
	}, [selectedYear]);

	// Load transactions when month changes
	useEffect(() => {
		if (selectedMonth) {
			getTransactionsForMonth(selectedMonth.month, selectedMonth.year);
		}
	}, [selectedMonth]);

	const currentData = monthlyData[0];

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			{/* Header with filters and export */}
			<View className="bg-white px-4 py-3 border-b border-gray-200">
				<View className="flex-row justify-between items-center mb-3">
					<Text className="text-xl font-bold text-gray-800">Transactions</Text>
					<TouchableOpacity
						onPress={exportToCSV}
						disabled={isExporting || !currentData || currentData.transactions.length === 0}
						className={`flex-row items-center px-3 py-2 rounded-md ${
							isExporting || !currentData || currentData.transactions.length === 0 ? "bg-gray-300" : "bg-blue-600"
						}`}
					>
						<MaterialIcons
							name="file-download"
							size={16}
							color={isExporting || !currentData || currentData.transactions.length === 0 ? "#9CA3AF" : "white"}
						/>
						<Text
							className={`ml-1 text-sm font-medium ${
								isExporting || !currentData || currentData.transactions.length === 0 ? "text-gray-500" : "text-white"
							}`}
						>
							{isExporting ? "Exporting..." : "Export CSV"}
						</Text>
					</TouchableOpacity>
				</View>

				{/* Filter buttons */}
				{availableYears.length > 0 && (
					<View className="flex-row space-x-3">
						{/* Year selector */}
						<TouchableOpacity
							onPress={() => setShowYearSelector(!showYearSelector)}
							className="flex-1 bg-gray-100 px-3 py-2 rounded-md flex-row justify-between items-center"
						>
							<Text className="text-gray-700 font-medium">{selectedYear}</Text>
							<Ionicons name="chevron-down" size={16} color="#374151" />
						</TouchableOpacity>

						{/* Month selector */}
						<TouchableOpacity
							onPress={() => setShowMonthSelector(!showMonthSelector)}
							className="flex-1 bg-gray-100 px-3 py-2 rounded-md flex-row justify-between items-center"
							disabled={availableMonths.length === 0}
						>
							<Text className={`font-medium ${availableMonths.length === 0 ? "text-gray-400" : "text-gray-700"}`}>
								{selectedMonth?.label || "Select Month"}
							</Text>
							<Ionicons name="chevron-down" size={16} color="#374151" />
						</TouchableOpacity>
					</View>
				)}

				{/* Year selector dropdown */}
				{showYearSelector && (
					<View className="absolute top-20 left-4 right-52 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48">
						<ScrollView>
							{availableYears.map((year) => (
								<TouchableOpacity
									key={year}
									onPress={() => {
										setSelectedYear(year);
										setShowYearSelector(false);
									}}
									className={`px-3 py-3 border-b border-gray-100 ${selectedYear === year ? "bg-blue-50" : ""}`}
								>
									<Text className={`${selectedYear === year ? "text-blue-600 font-medium" : "text-gray-700"}`}>
										{year}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				)}

				{/* Month selector dropdown */}
				{showMonthSelector && (
					<View className="absolute top-20 left-52 right-4 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48">
						<ScrollView>
							{availableMonths.map((month) => (
								<TouchableOpacity
									key={`${month.year}-${month.month}`}
									onPress={() => {
										setSelectedMonth(month);
										setShowMonthSelector(false);
									}}
									className={`px-3 py-3 border-b border-gray-100 ${
										selectedMonth?.month === month.month ? "bg-blue-50" : ""
									}`}
								>
									<Text
										className={`${
											selectedMonth?.month === month.month ? "text-blue-600 font-medium" : "text-gray-700"
										}`}
									>
										{month.label}
									</Text>
								</TouchableOpacity>
							))}
						</ScrollView>
					</View>
				)}
			</View>

			{/* Summary cards */}
			{currentData && (
				<View className="px-4 py-3 bg-white border-b border-gray-200">
					<View className="flex-row space-x-3">
						<View className="flex-1 bg-green-50 border-l-4 border-green-600 rounded-md p-3">
							<Text className="text-green-600 text-sm font-medium">Income</Text>
							<Text className="text-green-800 text-lg font-bold">₦{currentData.totalIncome.toLocaleString()}</Text>
						</View>
						<View className="flex-1 bg-red-50 border-l-4 border-red-600 rounded-md p-3">
							<Text className="text-red-600 text-sm font-medium">Expenses</Text>
							<Text className="text-red-800 text-lg font-bold">₦{currentData.totalExpense.toLocaleString()}</Text>
						</View>
						<View
							className={`flex-1 border-l-4 rounded-md p-3 ${
								currentData.netAmount >= 0 ? "bg-blue-50 border-blue-600" : "bg-orange-50 border-orange-600"
							}`}
						>
							<Text
								className={`text-sm font-medium ${currentData.netAmount >= 0 ? "text-blue-600" : "text-orange-600"}`}
							>
								Net
							</Text>
							<Text className={`text-lg font-bold ${currentData.netAmount >= 0 ? "text-blue-800" : "text-orange-800"}`}>
								₦{Math.abs(currentData.netAmount).toLocaleString()}
							</Text>
						</View>
					</View>
				</View>
			)}

			{/* Transactions list */}
			<ScrollView
				className="flex-1"
				refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
			>
				{availableYears.length === 0 ? (
					<View className="flex-1 justify-center items-center px-4 py-20">
						<Ionicons name="receipt-outline" size={80} color="#9CA3AF" />
						<Text className="text-gray-500 text-xl font-medium mt-6 text-center">No transactions yet</Text>
						<Text className="text-gray-400 text-base mt-3 text-center">
							Start adding transactions to see them organized by month here
						</Text>
					</View>
				) : currentData && currentData.transactions.length > 0 ? (
					<View className="px-4 py-2">
						<Text className="text-gray-600 text-sm mb-3">
							{currentData.transactions.length} transaction{currentData.transactions.length !== 1 ? "s" : ""} in{" "}
							{currentData.month} {currentData.year}
						</Text>
						{currentData.transactions.map((transaction) => (
							<View key={transaction.id} className="mb-2">
								<TransactionItem transaction={transaction} showDate={true} onDelete={handleDeleteTransaction} />
							</View>
						))}
					</View>
				) : selectedMonth ? (
					<View className="flex-1 justify-center items-center px-4 py-20">
						<Ionicons name="receipt-outline" size={64} color="#9CA3AF" />
						<Text className="text-gray-500 text-lg font-medium mt-4 text-center">No transactions found</Text>
						<Text className="text-gray-400 text-sm mt-2 text-center">
							No transactions recorded for {selectedMonth.label} {selectedYear}
						</Text>
					</View>
				) : (
					<View className="flex-1 justify-center items-center px-4 py-20">
						<Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
						<Text className="text-gray-500 text-lg font-medium mt-4 text-center">
							Select a month to view transactions
						</Text>
						<Text className="text-gray-400 text-sm mt-2 text-center">
							Choose a year and month from the filters above
						</Text>
					</View>
				)}
			</ScrollView>

			{/* Delete Confirmation Modal */}
			{transactionToDelete && (
				<DeleteConfirmationModal
					showModal={showDeleteModal}
					closeModal={closeDeleteModal}
					onConfirmDelete={confirmDeleteTransaction}
					transactionType={transactionToDelete.type}
					transactionAmount={transactionToDelete.amount}
					transactionCategory={transactionToDelete.category}
				/>
			)}
		</SafeAreaView>
	);
}
