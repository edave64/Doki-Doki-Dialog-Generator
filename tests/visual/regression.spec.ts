import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG, PNGWithMetadata } from 'pngjs';
import consumers from 'stream/consumers';

const ci = !!process.env.CI;

// We use a different set of expected output files in CI, since rendering sadly varies wildly
// between environments. Even the same browser on different OSes can produce different results.
// expected-output is for your local dev environment, expected-output-ci for CI.
// Don't attempt to compare them 1:1, but obviously they should be very similar.
const expectedDir = ci
	? path.resolve('tests/visual/expected-output-ci')
	: path.resolve('tests/visual/expected-output');
const savesDir = path.resolve('tests/visual/saves');
const diffDir = path.resolve('tests/visual/diffs');
const actualDir = path.resolve('tests/visual/actual-output');

const updateExpected = process.env.DDDG_VRT_UPDATE_EXPECTED === '1';

test.describe('Visual Regression Tests', () => {
	const saves = fs.readdirSync(savesDir);

	for (const save of saves) {
		const fullSavePath = path.join(savesDir, save);
		const testName = path.basename(save).split('.').slice(0, -1).join('.');
		if (testName === '') continue;
		test(`${testName} should match expected output`, async ({
			page,
			browserName,
		}) => {
			await page.goto('/');
			// Open panels tool
			page.locator('#toolbar').getByTitle('Panels').click();

			// Feed save file into browser
			const button = page.getByRole('button', { name: 'Quick Load' });
			await button.waitFor();
			const loadFinishedEvent = button.evaluate(
				(el) =>
					new Promise<void>((resolve) => {
						el.addEventListener('dddg-load-finished', () => {
							resolve();
						});
					})
			);
			await button
				.locator('input[type="file"]')
				.setInputFiles(fullSavePath);
			await loadFinishedEvent;

			// Export image
			const downloadPromise = page.waitForEvent('download');
			await page
				.getByRole('button', { name: 'Download' })
				.first()
				.click();
			const download = await downloadPromise;

			let expectedPngPath = path.join(
				expectedDir,
				browserName,
				testName + '.png'
			);

			if (updateExpected || !fs.existsSync(expectedPngPath)) {
				// In CI, we write to the actual output directory, since that gets saved as an
				// artifact.
				// In local development we write to the expected output directory, for convenience
				if (ci) {
					expectedPngPath = path.join(
						actualDir,
						browserName,
						testName + '.png'
					);
				}
				await fs.promises.mkdir(path.dirname(expectedPngPath), {
					recursive: true,
				});
				await fs.promises.writeFile(
					expectedPngPath,
					await download.createReadStream()
				);
				return;
			}

			const [expectedPNG, actualBuffer] = await Promise.all([
				getPNG(expectedPngPath),
				(async () => {
					return await consumers.buffer(
						await download.createReadStream()
					);
				})(),
			]);

			const actualPNG = PNG.sync.read(actualBuffer);
			const { width, height } = expectedPNG;
			let diff: PNG | null = null;

			let difference = 0;
			if (width !== actualPNG.width || height !== actualPNG.height) {
				difference = -1;
			} else {
				diff = new PNG({ width, height });
				difference = pixelmatch(
					expectedPNG.data,
					actualPNG.data,
					diff.data,
					width,
					height,
					{ threshold: 0 }
				);
			}

			if (difference > 0) {
				// Only save if there is a difference
				const diffPath = path.join(
					diffDir,
					browserName,
					testName + '.png'
				);
				const actualPath = path.join(
					actualDir,
					browserName,
					testName + '.png'
				);
				await Promise.all([
					(async () => {
						await fs.promises.mkdir(path.dirname(actualPath), {
							recursive: true,
						});
						await fs.promises.writeFile(actualPath, actualBuffer);
					})(),
					async () => {
						if (diff) {
							await fs.promises.mkdir(path.dirname(diffPath), {
								recursive: true,
							});
							await fs.promises.writeFile(
								diffPath,
								PNG.sync.write(diff)
							);
						}
					},
				]);
			}
			expect(difference).toBe(0);
		});
	}
});

async function getPNG(filename: string): Promise<PNGWithMetadata> {
	const expected = await fs.promises.readFile(filename);
	return PNG.sync.read(expected);
}
