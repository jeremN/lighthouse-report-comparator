export async function generateRandomString(len = 6) {
	let crypto;

	try {
		const array = new Uint8Array((len || 40) / 2);

		crypto = await import('crypto');

		if (!crypto) {
			return Array.from(array, dec => dec.toString(16).padStart(2, '0')).join('');
		}

		return crypto.webcrypto.getRandomValues(array);
	} catch (err) {
		console.error('[REPORTER ERROR] - crypto support is disabled!', err);
	}
}
