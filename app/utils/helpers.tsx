export function formatNumberInThousand(number: number): string | number | undefined {
	if (!number) return 0;
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
