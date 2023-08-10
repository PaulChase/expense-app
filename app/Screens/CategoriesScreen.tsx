import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { FlatList, SafeAreaView, ScrollView, Text, View, RefreshControl } from "react-native";
import CategoryItem from "../Components/CategoryItem";
import { EachTransactionItem } from "../utils/types";
import * as SQLite from "expo-sqlite";
import { formatNumberInThousand } from "../utils/helpers";

export default function CategoriesScreen() {
	const db = SQLite.openDatabase("data.db");

	const [categories, setCategories] = useState<string[]>([]);
	const [expenses, setExpenses] = useState<EachTransactionItem[]>([]);
	const [isLoading, setisLoading] = useState(false);

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

		return formatNumberInThousand(totalExpense);
	};

	const handleOnRefresh = React.useCallback(() => {
		setisLoading(true);
		getExpenses();
		setisLoading(false);
	}, []);

	return (
		<SafeAreaView>
			<ScrollView
				className="p-4 min-h-screen"
				refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleOnRefresh} />}
			>
				<View className=" flex flex-row items-center justify-between mt-2">
					<Text className=" font-semibold  text-xl">Bills Categories</Text>
					<Text className=" font-semibold  text-gray-500 text-lg">Total Spent</Text>
				</View>

				<View className=" pb-60 mt-8">
					{categories.map((category, index) => (
						<CategoryItem category={category} key={index} getCategoryTotalExpense={getCategoryTotalExpense} />
					))}
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}
