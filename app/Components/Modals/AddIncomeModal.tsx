import React, { useContext, useState } from "react";
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AddIncomeProps } from "../../utils/types";

interface AddIncomeModalProps {
	showModal: boolean;
	closeModal: () => void;
	addIncome: (expense: AddIncomeProps) => void;
}

export default function AddIncomeModal({ showModal, closeModal, addIncome }: AddIncomeModalProps) {
	const [amount, setAmount] = useState("");

	const handleAddIncome = () => {
		addIncome({ amount });
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
					<Text className=" text-lg text-green-600 mb-6 text-center font-semibold">Record Income</Text>

					<TextInput
						value={amount}
						className="px-2 py-3 bg-gray-100 rounded-md border border-gray-200 "
						placeholder={"amount"}
						onChangeText={setAmount}
						keyboardType="phone-pad"
					/>

					<TouchableOpacity activeOpacity={0.6} onPress={handleAddIncome}>
						<View className=" bg-blue-600 px-4 py-3 rounded-lg flex-row justify-center space-x-3 mt-6">
							<Text className="text-center text-sm text-white font-semibold">Add Income</Text>
						</View>
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
}
