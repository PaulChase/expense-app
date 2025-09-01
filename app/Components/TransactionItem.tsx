import React from "react";
import { Text, View } from "react-native";
import { formatNumberInThousand } from "../utils/helpers";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface Transaction {
	type: string;
	amount: number;
	date: string;
	category?: string;
}

interface TransactionItemProps {
	transaction: Transaction;
	showDate?: boolean;
}

export default function TransactionItem({ transaction, showDate = true }: TransactionItemProps) {
	const isIncome = transaction.type === "income";

	// Get category icon
	const getCategoryIcon = (category?: string) => {
		if (!category) return isIncome ? "cash-plus" : "cash-minus";

		const iconMap: { [key: string]: string } = {
			Food: "food",
			Health: "medical-bag",
			Transport: "car",
			Entertainment: "gamepad-variant",
			Fashion: "tshirt-crew",
			Education: "school",
			Utility: "lightning-bolt",
			Shopping: "shopping",
			"Personal Care": "face-woman",
			Bills: "file-document",
			Investments: "trending-up",
		};

		return iconMap[category] || (isIncome ? "cash-plus" : "cash-minus");
	};

	return (
		<View className="bg-white p-4 rounded-2xl mt-3 shadow-sm border border-gray-100">
			<View className="flex flex-row items-center justify-between">
				<View className="flex flex-row items-center flex-1">
					{/* Icon Container */}
					<View className={`p-3 rounded-full mr-3 ${isIncome ? "bg-green-100" : "bg-red-100"}`}>
						<MaterialCommunityIcons
							name={getCategoryIcon(transaction.category) as any}
							size={20}
							color={isIncome ? "#059669" : "#DC2626"}
						/>
					</View>

					{/* Transaction Details */}
					<View className="flex-1">
						<View className="flex flex-row items-center justify-between">
							<Text className="text-gray-800 font-semibold text-base">
								{transaction.category || (isIncome ? "Income" : "Expense")}
							</Text>
							<Text className={`font-bold text-lg ${isIncome ? "text-green-600" : "text-red-600"}`}>
								{isIncome ? "+" : "-"}₦ {formatNumberInThousand(transaction.amount)}
							</Text>
						</View>

						{showDate && (
							<Text className="text-gray-500 text-sm mt-1">
								{new Date(transaction.date).toLocaleDateString("en-US", {
									month: "short",
									day: "numeric",
									year: "numeric",
								})}
							</Text>
						)}
					</View>
				</View>
			</View>
		</View>
	);
}
