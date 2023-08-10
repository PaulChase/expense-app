import React from "react";
import { Text, View } from "react-native";
import { Octicons } from "@expo/vector-icons";
import { formatNumberInThousand } from "../utils/helpers";

interface CategoryItemProps {
	category: {
		name: string;
		totalExpense: number;
	};
}

export default function CategoryItem({ category }: CategoryItemProps) {
	const borderColors600 = [
		"border-red-600",
		"border-orange-600",
		"border-yellow-600",
		"border-green-600",
		"border-teal-600",
		"border-blue-600",
		"border-indigo-600",
		"border-purple-600",
		"border-amber-600",
		"border-emerald-600",
		"border-cyan-600",
		"border-pink-600",
		"border-fuchsia-600",
		"border-rose-600",
		"border-cyan-600",
		"border-rose-600",
	];

	return (
		<View
			className={` flex flex-row items-center justify-between  bg-white p-3 rounded my-2 border-l-4 ${
				borderColors600[Math.floor(Math.random() * borderColors600.length)]
			}`}
		>
			<Text className=" font-medium text-lg">{category.name}</Text>
			<Text className=" font-semibold text-lg text-red-500 ">{formatNumberInThousand(category.totalExpense)}</Text>
		</View>
	);
}
