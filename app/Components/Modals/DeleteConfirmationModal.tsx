import React from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface DeleteConfirmationModalProps {
	showModal: boolean;
	closeModal: () => void;
	onConfirmDelete: () => void;
	transactionType: string;
	transactionAmount: number;
	transactionCategory?: string;
}

export default function DeleteConfirmationModal({
	showModal,
	closeModal,
	onConfirmDelete,
	transactionType,
	transactionAmount,
	transactionCategory,
}: DeleteConfirmationModalProps) {
	const isIncome = transactionType === "income";

	return (
		<Modal animationType="fade" transparent={true} visible={showModal} onRequestClose={closeModal}>
			<View className="flex-1 justify-center items-center bg-black/80">
				<View className="bg-white rounded-2xl p-6 mx-4 w-80 max-w-full">
					{/* Header */}
					<View className="flex-row justify-between items-center mb-4">
						<Text className="text-xl font-bold text-gray-800">Delete Transaction</Text>
						<TouchableOpacity onPress={closeModal} className="p-1">
							<Ionicons name="close-circle-outline" size={24} color="#6B7280" />
						</TouchableOpacity>
					</View>

					{/* Warning Icon */}
					<View className="items-center mb-4">
						<View className="bg-red-100 p-4 rounded-full">
							<Ionicons name="warning" size={32} color="#DC2626" />
						</View>
					</View>

					{/* Transaction Details */}
					<View className="mb-6">
						<Text className="text-gray-600 text-center mb-2">Are you sure you want to delete this transaction?</Text>

						<View
							className={`bg-gray-50 p-4 rounded-lg border-l-4 ${isIncome ? "border-green-500" : "border-red-500"}`}
						>
							<View className="flex-row justify-between items-center">
								<View>
									<Text className="font-semibold text-gray-800">
										{transactionCategory || (isIncome ? "Income" : "Expense")}
									</Text>
									<Text className="text-sm text-gray-500 capitalize">{transactionType}</Text>
								</View>
								<Text className={`font-bold text-lg ${isIncome ? "text-green-600" : "text-red-600"}`}>
									{isIncome ? "+" : "-"}₦{transactionAmount.toLocaleString()}
								</Text>
							</View>
						</View>

						<Text className="text-red-600 text-sm text-center mt-3 font-medium">This action cannot be undone.</Text>
					</View>

					{/* Action Buttons */}
					<View className="flex-row space-x-3">
						<TouchableOpacity onPress={closeModal} className="flex-1 bg-gray-200 py-3 rounded-lg">
							<Text className="text-gray-700 font-semibold text-center">Cancel</Text>
						</TouchableOpacity>

						<TouchableOpacity onPress={onConfirmDelete} className="flex-1 bg-red-600 py-3 rounded-lg">
							<Text className="text-white font-semibold text-center">Delete</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</Modal>
	);
}
