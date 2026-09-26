import { Locator, Page, TestInfo } from '@playwright/test';
import { test, expect } from '../fixtures';

const curaBaseUrl = 'https://katalon-demo-cura.herokuapp.com';
const validUsername = 'John Doe';
const validPassword = 'ThisIsNotAPassword';
const facilities = [
    'Tokyo CURA Healthcare Center',
    'Hongkong CURA Healthcare Center',
    'Seoul CURA Healthcare Center',
];
const visitDates = ['2024-06-01', '2024-06-15', '2024-06-30'];

test.use({ baseURL: curaBaseUrl });

async function captureEvidence(
    page: Page,
    testInfo: TestInfo,
    target?: Locator,
) {
    const safeTitle = testInfo.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase();
    const filename = `${testInfo.project.name}-${safeTitle}-retry-${testInfo.retry}.png`;
    const path = `evidencia/${filename}`;

    if (target) {
        await target.screenshot({ path });
    } else {
        await page.screenshot({ path, fullPage: true });
    }
}

test.describe('Parcial 2 - CURA Healthcare Service', () => {
    test.beforeEach(async ({ curaPage }) => {
        await curaPage.navigate();
    });

    test('Login exitoso muestra el formulario de cita', async ({ curaPage, page }, testInfo) => {
        await curaPage.login(validUsername, validPassword);

        await expect(curaPage.facilitySelect).toBeVisible();
        await captureEvidence(page, testInfo);
    });

    test('Login fallido muestra el mensaje de error', async ({ curaPage, page }, testInfo) => {
        await curaPage.login('wrong_user', 'wrong_password');

        await curaPage.expectLoginError(
            'Login failed! Please ensure the username and password are valid.',
        );
        await captureEvidence(page, testInfo, curaPage.errorMessage);
    });

    test.describe('Selección de sede', () => {
        test.beforeEach(async ({ curaPage }) => {
            await curaPage.login(validUsername, validPassword);
            await expect(curaPage.facilitySelect).toBeVisible();
        });

        for (const facility of facilities) {
            test(`Selecciona la sede ${facility}`, async ({ curaPage, page }, testInfo) => {
                await curaPage.selectFacility(facility);

                await expect(curaPage.facilitySelect).toHaveValue(facility);
                await captureEvidence(page, testInfo);
            });
        }
    });

    test.describe('Selección de fecha', () => {
        test.beforeEach(async ({ curaPage }) => {
            await curaPage.login(validUsername, validPassword);
            await expect(curaPage.visitDateInput).toBeVisible();
        });

        for (const visitDate of visitDates) {
            test(`Selecciona la fecha ${visitDate}`, async ({ curaPage, page }, testInfo) => {
                await curaPage.selectVisitDate(visitDate);
                const [year, month, day] = visitDate.split('-');

                await expect(curaPage.visitDateInput).toHaveValue(`${day}/${month}/${year}`);
                await captureEvidence(page, testInfo);
            });
        }
    });
});