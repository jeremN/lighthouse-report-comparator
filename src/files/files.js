import fs from 'fs';

export function shouldCreateDir(dirName) {
	if (!fs.existsSync(dirName)) {
		fs.mkdirSync(dirName);
	}
}

export function getFiles(pathStr) {
	const output = fs.readFileSync(pathStr, 'utf8', (err, results) => {
		if (err) {
			console.error('[REPORTER ERROR] - error while reading file', err);
			return void 0;
		}
		return results;
	});
	return JSON.parse(output);
}
