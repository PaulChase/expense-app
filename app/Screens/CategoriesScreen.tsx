import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Text, View, RefreshControl, TouchableOpacity } from "react-native";
import CategoryItem from "../Components/CategoryItem";
import { EachTransactionItem } from "../utils/types";
import * as SQLite from "expo-sqlite";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import AddCategoryModal from "../Components/Modals/AddCategoryModal";

export default function CategoriesScreen() {
	const db = SQLite.openDatabase("data.db");

	const [categories, setCategories] = useState<string[]>([]);
	const [expenses, setExpenses] = useState<EachTransactionItem[]>([]);
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

	const getExpenses = () => {
		db.transaction((tx) => {
			db.exec(
				[
					{
						sql: "SELECT * FROM transactions WHERE type='expense'",
						args: [],
					},
				],
				false,
				(error, results) => setExpenses(results[0].rows)
			);
		});
	};

	useEffect(() => {
		getExpenses();
	}, []);

	const getCategoryTotalExpense = (category: string) => {
		const totalExpense = expenses
			.filter((transaction) => transaction.category === category)
			.reduce((sum, transaction) => sum + transaction.amount, 0);

		return totalExpense;
	};

	const handleOnRefresh = React.useCallback(() => {
		setisLoading(true);
		getExpenses();
		setisLoading(false);
	}, []);

	const toggleAddCategoryModal = () => setshowAddCategoryModal((prev) => !prev);

	const handleAddCategory = (category: string) => {
		setCategories((prev) => [...prev, category]);
		toggleAddCategoryModal();
	};

	return (
		<SafeAreaView>
			<View className=" relative">
				<ScrollView
					className="p-4 min-h-screen"
					refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleOnRefresh} />}
				>
					<View className=" flex flex-row items-center justify-between mt-2">
						<Text className=" font-semibold  text-xl">Bills Categories</Text>
						<Text className=" font-semibold  text-gray-500 text-lg">Total Spent</Text>
					</View>

					<View className=" pb-60 mt-4">
						{categories
							.map((category) => ({ name: category, totalExpense: getCategoryTotalExpense(category) }))
							.sort((a, b) => b.totalExpense - a.totalExpense) //sort expense in descending order
							.map((category, index) => (
								<CategoryItem category={category} key={index} />
							))}
					</View>
				</ScrollView>

				<TouchableOpacity
					activeOpacity={0.7}
					onPress={toggleAddCategoryModal}
					style={{ elevation: 10 }}
					className=" absolute right-10 bottom-5  z-50  bg-blue-600 h-16 w-16 flex items-center justify-center rounded-full mb-32"
				>
					<MaterialCommunityIcons name="tag-plus" size={24} color="white" />
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
