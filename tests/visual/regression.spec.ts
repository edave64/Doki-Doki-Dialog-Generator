import { expect, test } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import pixelmatch from 'pixelmatch';
import { PNG, PNGWithMetadata } from 'pngjs';
import consumers from 'stream/consumers';

const expectedDir = path.resolve('tests/visual/expected-output');
const savesDir = path.resolve('tests/visual/saves');
const diffDir = path.resolve('tests/visual/diffs');
const actualDir = path.resolve('tests/visual/actual-output');

const updateExpected = process.env.DDDG_VRT_UPDATE_EXPECTED === '1';

test.describe('Visual Regression Tests', () => {
	const saves = fs.readdirSync(savesDir);

	for (const save of saves) {
		const fullSavePath = path.join(savesDir, save);
		const testName = path.basename(save).split('.').slice(0, -1).join('.');
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

			const expectedPngPath = path.join(
				expectedDir,
				browserName,
				testName + '.png'
			);

			if (!fs.existsSync(expectedPngPath) || updateExpected) {
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
			const diff = new PNG({ width, height });

			const difference = pixelmatch(
				expectedPNG.data,
				actualPNG.data,
				diff.data,
				width,
				height,
				{ threshold: 0 }
			);

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
					fs.promises.mkdir(path.dirname(actualPath), {
						recursive: true,
					}),
					fs.promises.mkdir(path.dirname(diffPath), {
						recursive: true,
					}),
				]);
				fs.writeFileSync(actualPath, actualBuffer);
				fs.writeFileSync(diffPath, PNG.sync.write(diff));
			}
			expect(difference).toBe(0);
		});
	}
});

async function getPNG(filename: string): Promise<PNGWithMetadata> {
	const expected = await fs.promises.readFile(filename);
	return PNG.sync.read(expected);
}
