import React from "react";
import { Text, View } from "react-native";
import { Octicons } from "@expo/vector-icons";
import { formatNumberInThousand } from "../utils/helpers";

interface CategoryItemProps {
	category: {
		name: string;
		totalExpense: number;
		totalIncome: number;
		netAmount: number;
	};
}

export default function CategoryItem({ category }: CategoryItemProps) {
	const getRandomColor = () => {
		const colors = [
			"bg-red-500",
			"bg-orange-500",
			"bg-yellow-500",
			"bg-green-500",
			"bg-teal-500",
			"bg-blue-500",
			"bg-indigo-500",
			"bg-purple-500",
			"bg-pink-500",
			"bg-emerald-500",
			"bg-cyan-500",
			"bg-fuchsia-500",
		];

		// Use category name to consistently get same color
		const index = category.name.length % colors.length;
		return colors[index];
	};

	const hasTransactions = category.totalExpense > 0 || category.totalIncome > 0;

	return (
		<View className="bg-white rounded-xl p-4 mb-3 shadow-sm border border-gray-100">
			<View className="flex flex-row items-center justify-between mb-3">
				<View className="flex flex-row items-center flex-1">
					<View className={`w-4 h-4 rounded-full mr-3 ${getRandomColor()}`} />
					<Text className="font-semibold text-lg text-gray-800 flex-1">{category.name}</Text>
				</View>

				{hasTransactions && (
					<View className="flex flex-row items-center">
						<Octicons
							name={category.netAmount >= 0 ? "arrow-up" : "arrow-down"}
							size={16}
							color={category.netAmount >= 0 ? "#10b981" : "#ef4444"}
						/>
						<Text
							className={`font-semibold text-sm ml-1 ${category.netAmount >= 0 ? "text-green-600" : "text-red-600"}`}
						>
							{category.netAmount >= 0 ? "+" : ""}
							{formatNumberInThousand(category.netAmount)}
						</Text>
					</View>
				)}
			</View>

			{hasTransactions ? (
				<View className="flex flex-row justify-between space-x-3">
					<View className="flex-1">
						<Text className="text-xs text-gray-500 mb-1 font-medium">Income</Text>
						<View className="bg-green-50 rounded-lg p-3 border border-green-100">
							<Text className="font-bold text-green-700 text-center">
								+{formatNumberInThousand(category.totalIncome)}
							</Text>
						</View>
					</View>

					<View className="flex-1">
						<Text className="text-xs text-gray-500 mb-1 font-medium">Expense</Text>
						<View className="bg-red-50 rounded-lg p-3 border border-red-100">
							<Text className="font-bold text-red-700 text-center">
								-{formatNumberInThousand(category.totalExpense)}
							</Text>
						</View>
					</View>
				</View>
			) : (
				<View className="bg-gray-50 rounded-lg p-3 border border-gray-100">
					<Text className="text-gray-500 text-center text-sm font-medium">No transactions yet</Text>
				</View>
			)}
		</View>
	);
}
