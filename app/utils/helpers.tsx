export function formatNumberInThousand(number: number): string | undefined {
	if (!number) return;
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
