import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import puppeteer from 'puppeteer';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { amount, date, months, rate } = body;

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto('https://arquiler.com/', { waitUntil: 'networkidle0' });

    const result = await page.evaluate(async (params) => {
      const response = await fetch('/rent/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-Inertia': 'true',
          'X-Inertia-Version': '8b079d17f83d4cccc4adec4943e35ffb',
          'X-Inertia-Partial-Component': 'welcome',
          'X-Inertia-Partial-Data': 'rentResults',
        },
        body: JSON.stringify(params),
      });
      return await response.json();
    }, { amount, date, months, rate, origin: 'https://arquiler.com/' });

    await browser.close();

    return NextResponse.json(result.props.rentResults);
  } catch (error) {
    console.error('Error calculating rent:', error);
    return NextResponse.json({ error: 'Error al calcular alquiler' }, { status: 500 });
  }
}
