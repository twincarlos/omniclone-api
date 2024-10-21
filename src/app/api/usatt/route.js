import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';

export const maxDuration = 20;

export async function POST(request) {
    const { siteUrl } = await request.json();

    const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

    const browser = await puppeteer.launch({
        args: isLocal ? puppeteer.defaultArgs() : chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: process.env.CHROME_EXECUTABLE_PATH || await chromium.executablePath(),
        headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(siteUrl);
    const pageTitle = await page.title();
    await browser.close();

    return Response.json(pageTitle)
}