import React, { useContext, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AddIncomeProps } from "../../utils/types";

interface AddCategoryModalProps {
	showModal: boolean;
	closeModal: () => void;
	addCategory: (category: string) => void;
}

export default function AddCategoryModal({ showModal, closeModal, addCategory }: AddCategoryModalProps) {
	const [category, setCategory] = useState("");

	const handleAddExpense = () => {
		addCategory(category.trim());
	};

	return (
		<Modal animationType="slide" transparent={true} visible={showModal} onRequestClose={closeModal}>
			<View className=" flex-1 bg-black/80 justify-center items-center px-4">
				<View className="  bg-white rounded-lg w-full p-4">
					<TouchableOpacity activeOpacity={0.6} onPress={closeModal}>
						<View className=" flex-row justify-end mb-3">
							<Ionicons name="close-circle-outline" size={28} color="gray" />
						</View>
					</TouchableOpacity>
					<Text className=" text-lg text-green-600 mb-6 text-center font-semibold">Add New Category</Text>

					<TextInput
						value={category}
						className="px-2 py-3 bg-gray-100 rounded-md border border-gray-200 "
						placeholder={"category ..."}
						onChangeText={setCategory}
					/>

					<TouchableOpacity activeOpacity={0.6} onPress={handleAddExpense}>
						<View className=" bg-blue-600 px-4 py-3 rounded-lg flex-row justify-center space-x-3 mt-6">
							<Text className="text-center text-sm text-white font-semibold">Add Category</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}
