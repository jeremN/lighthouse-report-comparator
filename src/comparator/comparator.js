const metricsArray = new Set([
	'first-contentful-paint',
	'first-meaningful-paint',
	'speed-index',
	'estimated-input-latency',
	'total-blocking-time',
	'max-potential-fid',
	'time-to-first-byte',
	'first-cpu-idle',
	'interactive',
]);

function calcPercentageDiff(from, to = 0) {
	const per = ((to - from) / from) * 100;
	return Math.floor(per * 100) / 100;
}

export function compareReports(from, to) {
	// TODO better case handling
	if (!from?.audits || !to?.audits) return;

	for (let auditObj in from.audits) {
		if (metricsArray.has(auditObj)) {
			const percentDiff = calcPercentageDiff(
				from.audits?.[auditObj]?.numericValue,
				to.audits?.[auditObj]?.numericValue,
			);
			// TODO Add some colors
			const log = (() => {
				if (Math.sign(percentDiff === 0)) {
					return 'unchanged';
				}
				return `${percentDiff.toString().replace('-', '')}% ${Math.sign > 0 ? 'slower' : 'faster'}`;
			})();

			console.log(`${from.audits?.[auditObj]?.title} is ${log}`);
		}
	}
}
