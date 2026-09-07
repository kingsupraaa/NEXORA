import { NextRequest, NextResponse } from 'next/server';
import { getDispatchedAlerts, triggerInstantAlertScan, DEFAULT_ALERT_RULES } from '@/lib/alerts/alert-engine';

export async function GET() {
  try {
    const alerts = getDispatchedAlerts();
    return NextResponse.json({
      alerts,
      rules: DEFAULT_ALERT_RULES,
      totalAlerts: alerts.length,
      criticalCount: alerts.filter(a => a.severity === 'CRITICAL').length
    });
  } catch (err) {
    console.error('Error fetching alerts:', err);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = triggerInstantAlertScan();
    return NextResponse.json({
      success: true,
      message: `Automated alert scan completed. Dispatched ${result.count} priority alerts across WhatsApp, Email, and SMS.`,
      ...result
    });
  } catch (err) {
    console.error('Error triggering alert dispatch:', err);
    return NextResponse.json({ error: 'Failed to trigger alerts' }, { status: 500 });
  }
}
