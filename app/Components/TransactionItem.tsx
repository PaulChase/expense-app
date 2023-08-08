import React from "react";
import { Text, View } from "react-native";
import { formatNumberInThousand } from "../utils/helpers";

interface Transaction {
	type: string;
	amount: number;
	date: string;
	category?: string;
}

interface TransactionItemProps {
	transaction: Transaction;
}

export default function TransactionItem({ transaction }: TransactionItemProps) {
	return (
		<View
			className={`p-3 bg-white border-l-4  rounded-md mt-4 ${
				transaction.type === "income" ? "border-green-600" : "border-red-500"
			} `}
		>
			<View className=" flex flex-row items-center justify-between">
				<Text
					className={`text-xl text-red-600 font-bold mt-1 mb-2 ${
						transaction.type === "income" ? "text-green-600" : "text-red-500"
					}`}
				>
					₦ {formatNumberInThousand(transaction.amount)}
				</Text>

				{transaction.category && <Text className=" font-semibold text-gray-500 text-sm">{transaction.category}</Text>}
			</View>
			<Text>{new Date(transaction.date).toDateString()}</Text>
		</View>
	);
}
