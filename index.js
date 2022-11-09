import fs from 'fs';
import path from 'path';

import arg from 'arg';
import lighthouse from 'lighthouse';
import chromeLauncher from 'chrome-launcher';
import glob from 'glob';

import { compareReports } from './src/comparator/comparator.js';
import { getFiles, shouldCreateDir } from './src/files/files.js';
import { generateRandomString } from './src/utils/randomStringGenerator.js';

// TODO: parse & read config file for CLI

const _DEFAULT_REPORT_FOLDER = 'reports';

async function runChrome(url) {
	const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
	const options = {
		logLevel: 'info',
		output: 'json',
		// onlyCategories: ['performance'],
		port: chrome.port,
	};
	const result = await lighthouse(url, options);

	await chrome.kill();
	return { js: result.lhr, json: result.report };
}

// See to add more options
function parseArgumentsIntoOptions(rawArgs) {
	const args = arg(
		{
			'--url': String,
			'--from': String,
			'--to': String,
			'-u': '--url',
			'-f': '--from',
			'-t': '--to',
		},
		{
			argv: rawArgs.slice(2),
		},
	);

	return {
		url: args['--url'] || null,
		from: args['--from'] || null,
		to: args['--to'] || null,
	};
}

const getMax = dates => dates.reduce((a, b) => Math.max(a, b));

async function init(args) {
	if (!args) {
		console.error('[REPORTER ERROR] - you must provide an argument');
	}

	const parsedArgs = parseArgumentsIntoOptions(args);

	if (parsedArgs?.url) {
		const url = new URL(parsedArgs.url);
		let dirName = _DEFAULT_REPORT_FOLDER + '/' + url.host.replace('www', '');
		if (url.pathname !== '/') {
			dirName = dirName + url.pathname.replace(/\//g, '_');
		}

		shouldCreateDir(dirName);

		url.searchParams.append('x', await generateRandomString());
		const reports = await runChrome(url.toString());
		const prevReports = glob(`${dirName}/*.json`, { sync: true });

		let dates = [];
		if (prevReports.length) {
			for (const report in prevReports) {
				dates.push(new Date(path.parse(prevReports[report]).name.replace(/_/g, ':')));
			}

			const max = getMax(dates);
			const recentReport = new Date(max).toISOString();
			const recentReportContents = getFiles(`${dirName}/${recentReport.replace(/:/g, '_')}.json`);

			compareReports(recentReportContents, reports.js);
		}

		fs.writeFile(
			`${dirName}/${reports.js['fetchTime'].replace(/:/g, '_')}.json`,
			reports.json,
			err => {
				if (err) throw err;
			},
		);
	} else if (parsedArgs?.from && parsedArgs?.to) {
		compareReports(getFiles(`${parsedArgs.from}.json`), getFiles(`${parsedArgs.to}.json`));
	} else {
		throw Error("[REPORTER ERROR] - You haven't passed an argument");
	}
}

init(process.argv);
