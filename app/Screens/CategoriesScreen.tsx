import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, View, RefreshControl, TouchableOpacity } from "react-native";
import CategoryItem from "../Components/CategoryItem";
import { EachTransactionItem } from "../utils/types";
import * as SQLite from "expo-sqlite";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import AddCategoryModal from "../Components/Modals/AddCategoryModal";
import Toast from "react-native-toast-message";

// Initialize database asynchronously
let db: SQLite.SQLiteDatabase | null = null;

const initDatabase = async () => {
	if (!db) {
		db = await SQLite.openDatabaseAsync("data.db");
		await db.execAsync(`
			CREATE TABLE IF NOT EXISTS transactions (
				id INTEGER PRIMARY KEY AUTOINCREMENT, 
				amount FLOAT NOT NULL, 
				type VARCHAR(255) NOT NULL, 
				category VARCHAR(255), 
				date DATETIME NOT NULL
			)
		`);
	}
	return db;
};

export default function CategoriesScreen() {
	const [categories, setCategories] = useState<string[]>([]);
	const [transactions, setTransactions] = useState<EachTransactionItem[]>([]);
	const [isLoading, setisLoading] = useState(false);
	const [showAddCategoryModal, setshowAddCategoryModal] = useState(false);

	// get categories count from storage
	useEffect(() => {
		let isMounted = true;

		const getCategoriesFromStorage = async () => {
			try {
				const value = await AsyncStorage.getItem("categories");
				if (value !== null && isMounted) {
					setCategories(JSON.parse(value));
				} else if (value === null && isMounted) {
					// this will run for the 1st time
					setCategories([
						"Food",
						"Health",
						"Transport",
						"Entertainment",
						"Fashion",
						"Education",
						"Utility",
						"Shopping",
						"Personal Care",
						"Bills",
						"Investments",
					]);
				}
			} catch (e) {
				alert("couldnt get categories ");
			}
		};

		getCategoriesFromStorage();

		return () => {
			isMounted = false;
		};
	}, []);

	// set the categories  in storage after its value changes
	useEffect(() => {
		const updateCategoriesInStorage = async () => {
			try {
				await AsyncStorage.setItem("categories", JSON.stringify(categories));
			} catch (error) {
				alert(error);
			}
		};

		updateCategoriesInStorage();
	}, [categories]);

	const getAllTransactions = async () => {
		try {
			const database = await initDatabase();
			const result = await database.getAllAsync(
				"SELECT * FROM transactions WHERE category IS NOT NULL AND category != ''"
			);
			setTransactions(result as EachTransactionItem[]);
		} catch (error) {
			console.error("Error getting transactions:", error);
		}
	};

	useEffect(() => {
		getAllTransactions();
	}, []);

	const getCategoryTotals = (category: string) => {
		const categoryTransactions = transactions.filter((transaction) => transaction.category === category);

		const totalExpense = categoryTransactions
			.filter((transaction) => transaction.type === "expense")
			.reduce((sum, transaction) => sum + transaction.amount, 0);

		const totalIncome = categoryTransactions
			.filter((transaction) => transaction.type === "income")
			.reduce((sum, transaction) => sum + transaction.amount, 0);

		return { totalExpense, totalIncome };
	};

	const handleOnRefresh = React.useCallback(async () => {
		setisLoading(true);
		await getAllTransactions();
		setisLoading(false);
	}, []);

	const toggleAddCategoryModal = () => setshowAddCategoryModal((prev) => !prev);

	const handleAddCategory = (category: string) => {
		setCategories((prev) => [...prev, category]);
		toggleAddCategoryModal();
		Toast.show({
			type: "success",
			text1: "Category added 👍",
		});
	};

	return (
		<SafeAreaView className="flex-1 bg-gray-50">
			<View className="relative flex-1">
				<ScrollView
					className="px-4 py-6"
					refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleOnRefresh} />}
					showsVerticalScrollIndicator={false}
				>
					<View className="flex flex-row items-center justify-between mt-2 mb-1">
						<Text className="font-bold text-2xl text-gray-800">Categories</Text>
						<View className="flex flex-row items-center space-x-4">
							<View className="flex flex-row items-center">
								<View className="w-3 h-3 bg-green-500 rounded-full mr-1"></View>
								<Text className="font-medium text-sm text-gray-600">Income</Text>
							</View>
							<View className="flex flex-row items-center">
								<View className="w-3 h-3 bg-red-500 rounded-full mr-1"></View>
								<Text className="font-medium text-sm text-gray-600">Expense</Text>
							</View>
						</View>
					</View>

					<View className="pb-60 mt-4">
						{categories
							.map((category) => {
								const totals = getCategoryTotals(category);
								return {
									name: category,
									totalExpense: totals.totalExpense,
									totalIncome: totals.totalIncome,
									netAmount: totals.totalIncome - totals.totalExpense,
								};
							})
							.filter((category) => category.totalExpense > 0 || category.totalIncome > 0).length === 0 ? (
							<View className="flex items-center justify-center py-16">
								<MaterialCommunityIcons name="chart-donut" size={64} color="#9ca3af" />
								<Text className="text-gray-500 text-lg font-medium mt-4">No transactions yet</Text>
								<Text className="text-gray-400 text-sm mt-2 text-center px-8">
									Start tracking your income and expenses to see category breakdowns here
								</Text>
							</View>
						) : (
							<>
								{categories
									.map((category) => {
										const totals = getCategoryTotals(category);
										return {
											name: category,
											totalExpense: totals.totalExpense,
											totalIncome: totals.totalIncome,
											netAmount: totals.totalIncome - totals.totalExpense,
										};
									})
									.filter((category) => category.totalExpense > 0 || category.totalIncome > 0) // Only show categories with transactions
									.sort((a, b) => b.totalExpense + b.totalIncome - (a.totalExpense + a.totalIncome)) // Sort by total activity
									.map((category, index) => (
										<CategoryItem category={category} key={index} />
									))}

								{categories
									.map((category) => {
										const totals = getCategoryTotals(category);
										return {
											name: category,
											totalExpense: totals.totalExpense,
											totalIncome: totals.totalIncome,
											netAmount: totals.totalIncome - totals.totalExpense,
										};
									})
									.filter((category) => category.totalExpense === 0 && category.totalIncome === 0).length > 0 && (
									<View className="mt-6">
										<Text className="font-semibold text-lg text-gray-600 mb-3">Unused Categories</Text>
										{categories
											.map((category) => {
												const totals = getCategoryTotals(category);
												return {
													name: category,
													totalExpense: totals.totalExpense,
													totalIncome: totals.totalIncome,
													netAmount: totals.totalIncome - totals.totalExpense,
												};
											})
											.filter((category) => category.totalExpense === 0 && category.totalIncome === 0)
											.map((category, index) => (
												<CategoryItem category={category} key={`unused-${index}`} />
											))}
									</View>
								)}
							</>
						)}
					</View>
				</ScrollView>

				<TouchableOpacity
					activeOpacity={0.8}
					onPress={toggleAddCategoryModal}
					style={{
						elevation: 8,
						shadowColor: "#3b82f6",
						shadowOffset: { width: 0, height: 4 },
						shadowOpacity: 0.3,
						shadowRadius: 8,
					}}
					className="absolute right-6 bottom-8 z-50 bg-blue-600 h-14 w-14 flex items-center justify-center rounded-full "
				>
					<MaterialCommunityIcons name="tag-plus" size={22} color="white" />
				</TouchableOpacity>
			</View>

			{showAddCategoryModal && (
				<AddCategoryModal
					showModal={showAddCategoryModal}
					closeModal={toggleAddCategoryModal}
					addCategory={handleAddCategory}
				/>
			)}
		</SafeAreaView>
	);
}
