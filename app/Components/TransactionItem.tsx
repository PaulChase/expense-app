import React from "react";
import { Text, View } from "react-native";
import { formatNumberInThousand } from "../utils/helpers";

interface MessageItem {
	type: string;
	amount: number;
	date: string;
}

interface TransactionItemProps {
	message: MessageItem;
}

export default function TransactionItem({ message }: TransactionItemProps) {
	return (
		<View
			className={`p-3 bg-white border-l-4  rounded-md mt-4 ${
				message.type === "Credit" ? "border-green-600" : "border-red-500"
			} `}
		>
			<Text
				className={`text-xl text-red-600 font-bold mt-1 mb-2 ${
					message.type === "Credit" ? "text-green-600" : "text-red-500"
				}`}
			>
				₦ {formatNumberInThousand(message.amount)}
			</Text>
			<Text>{new Date(message.date).toDateString()}</Text>
		</View>
	);
}
