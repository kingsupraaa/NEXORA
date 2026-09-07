import { NextRequest, NextResponse } from 'next/server';
import { getPortfolioMetrics } from '@/lib/db/store';
import { generateExecutiveSummary } from '@/lib/ai/executive-summary';

export async function POST(request: NextRequest) {
  try {
    const metrics = getPortfolioMetrics();
    const summary = await generateExecutiveSummary(metrics);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating executive summary:', error);
    return NextResponse.json({ error: 'Failed to generate executive summary' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const metrics = getPortfolioMetrics();
    const summary = await generateExecutiveSummary(metrics);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching executive summary:', error);
    return NextResponse.json({ error: 'Failed to fetch executive summary' }, { status: 500 });
  }
}
