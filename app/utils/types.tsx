export interface EachTransactionItem {
	id: number;
	amount: number;
	type: string;
	date: string;
	category?: string;
	description?: string;
}

export interface AddExpenseProps {
	amount: string;
	category: string;
	description?: string;
}
export interface AddIncomeProps {
	amount: string;
	category?: string;
	description?: string;
}
