import React from "react";
import { Text, View } from "react-native";
import { formatNumberInThousand } from "../utils/helpers";

export default function TransactionItem() {
	return (
		<View className=" p-3 bg-white border-l-4 border-red-700 rounded-md mt-4">
			<Text className=" text-xl text-red-600 font-bold mt-1">₦ {formatNumberInThousand(1200)}</Text>
			<Text>Lorem ipsum dolor sit amet.</Text>
		</View>
	);
}
