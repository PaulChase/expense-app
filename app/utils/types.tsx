export interface EachTransactionItem {
	id: number;
	amount: number;
	type: string;
	date: string;
	category?: string;
}

export interface AddExpenseProps {
	amount: string;
	category: string;
}
export interface AddIncomeProps {
	amount: string;
}
