
/* Why this instead of the traditional Math.round(num * (10^places)) / (10^places)?
 * The above works for most cases, but it fails for 1.005. Interestingly, the below handles that case
 * even though in mathematical terms it is doing the same operation.
 */ 
export function round(toRound: number, places: number): number {
	return +(`${Math.round(+`${toRound}e+${places}`)}e-${places}`);
}