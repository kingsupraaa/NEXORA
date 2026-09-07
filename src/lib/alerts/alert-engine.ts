import { Project, AlertRule, TriggeredAlert, AlertChannel } from '@/types';
import { getAllProjects } from '@/lib/db/store';
import { calculateHealthScore } from '@/lib/calculations/health-score';
import { detectBottleneck } from '@/lib/calculations/dependency-graph';

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'rule-schedule-1',
    name: 'Critical Schedule Variance Slippage',
    condition: 'Physical progress lags planned target by > 15%',
    thresholdType: 'SCHEDULE_SLIP',
    thresholdValue: 15,
    channels: ['WHATSAPP', 'EMAIL', 'SMS'],
    targetRoles: ['Project Director', 'Nodal Officer'],
    isEnabled: true,
  },
  {
    id: 'rule-bottleneck-1',
    name: 'High-Impact Bottleneck Detected',
    condition: 'Delayed activity blocks >= 2 downstream activities',
    thresholdType: 'BOTTLENECK_BLOCKED',
    thresholdValue: 2,
    channels: ['WHATSAPP', 'EMAIL'],
    targetRoles: ['Department Secretary', 'Chief Engineer'],
    isEnabled: true,
  },
  {
    id: 'rule-budget-1',
    name: 'Capital Expenditure Burn Warning',
    condition: 'Spend utilization exceeds physical completion by > 20%',
    thresholdType: 'BUDGET_OVERRUN',
    thresholdValue: 20,
    channels: ['EMAIL', 'WEBHOOK'],
    targetRoles: ['Finance Controller', 'Principal Secretary'],
    isEnabled: true,
  },
  {
    id: 'rule-risk-1',
    name: 'Unmitigated Statutory / Land Acquisition Risk',
    condition: 'Critical severity risk remains Open > 7 days',
    thresholdType: 'CRITICAL_RISK',
    thresholdValue: 1,
    channels: ['WHATSAPP', 'EMAIL', 'SMS'],
    targetRoles: ['District Magistrate', 'Revenue Officer'],
    isEnabled: true,
  }
];

let cachedDispatchedAlerts: TriggeredAlert[] = [];

export function evaluateAndGenerateAlerts(rules = DEFAULT_ALERT_RULES): TriggeredAlert[] {
  const projects = getAllProjects();
  const alerts: TriggeredAlert[] = [];

  for (const project of projects) {
    const health = calculateHealthScore(project);
    const bottleneck = detectBottleneck(project);

    // 1. Schedule Slip Rule
    const schedRule = rules.find(r => r.thresholdType === 'SCHEDULE_SLIP' && r.isEnabled);
    if (schedRule && Math.abs(health.scheduleVariancePercentage) >= schedRule.thresholdValue && health.scheduleVariancePercentage < 0) {
      schedRule.channels.forEach((ch, idx) => {
        alerts.push({
          id: `alert-sched-${project.id}-${ch.toLowerCase()}`,
          ruleId: schedRule.id,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.code,
          severity: 'CRITICAL',
          title: `[SCHEDULE ALERT] ${project.name} is ${Math.abs(health.scheduleVariancePercentage)}% Behind Target`,
          message: `Automated threshold breach: Physical completion is ${project.progress}% vs planned ${project.plannedProgress}%. Estimated project delay: +${health.scheduleVarianceDays} calendar days.`,
          impact: `Critical delivery risk for ${project.location} ${project.sector} zone.`,
          recipient: `${project.manager} (${schedRule.targetRoles[0]})`,
          channel: ch,
          dispatchedAt: new Date(Date.now() - (idx * 1000 * 60 * 15)).toISOString(),
          status: 'DELIVERED',
          actionUrl: `/projects/${project.id}`
        });
      });
    }

    // 2. Bottleneck Blocked Rule
    const bnRule = rules.find(r => r.thresholdType === 'BOTTLENECK_BLOCKED' && r.isEnabled);
    if (bnRule && bottleneck.bottleneckActivity && bottleneck.blockedActivityCount >= bnRule.thresholdValue) {
      bnRule.channels.forEach((ch, idx) => {
        alerts.push({
          id: `alert-bn-${project.id}-${ch.toLowerCase()}`,
          ruleId: bnRule.id,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.code,
          severity: 'CRITICAL',
          title: `[BOTTLENECK ALERT] "${bottleneck.bottleneckActivity?.name}" is Blocking ${bottleneck.blockedActivityCount} Activities`,
          message: `${bottleneck.department} delay of ${bottleneck.delayDays} days is stalling downstream packages: ${bottleneck.blockedActivities.map(a => a.name).slice(0, 2).join(', ')}.`,
          impact: `Total ${bottleneck.blockedActivityCount} downstream packages halted.`,
          recipient: `${bottleneck.department} Head & ${project.manager}`,
          channel: ch,
          dispatchedAt: new Date(Date.now() - (idx * 1000 * 60 * 30)).toISOString(),
          status: 'DELIVERED',
          actionUrl: `/actions`
        });
      });
    }

    // 3. Budget Burn Rule
    const budRule = rules.find(r => r.thresholdType === 'BUDGET_OVERRUN' && r.isEnabled);
    const spendOverProgress = health.budgetUtilizationPercentage - project.progress;
    if (budRule && spendOverProgress >= budRule.thresholdValue) {
      budRule.channels.forEach((ch, idx) => {
        alerts.push({
          id: `alert-bud-${project.id}-${ch.toLowerCase()}`,
          ruleId: budRule.id,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.code,
          severity: 'WARNING',
          title: `[FINANCIAL ALERT] Capex Burn Exceeds Physical Progress by ${Math.round(spendOverProgress)}%`,
          message: `₹${project.spent} Cr spent (${health.budgetUtilizationPercentage}% budget) against only ${project.progress}% physical progress. Financial overrun risk flagged.`,
          impact: `Potential capital shortfall before project commissioning.`,
          recipient: `Finance Controller & ${project.manager}`,
          channel: ch,
          dispatchedAt: new Date(Date.now() - (idx * 1000 * 60 * 45)).toISOString(),
          status: 'DELIVERED',
          actionUrl: `/projects/${project.id}`
        });
      });
    }

    // 4. Critical Risk Rule
    const riskRule = rules.find(r => r.thresholdType === 'CRITICAL_RISK' && r.isEnabled);
    const openCriticalRisks = project.risks.filter(r => r.severity === 'Critical' && r.status === 'Open');
    if (riskRule && openCriticalRisks.length >= riskRule.thresholdValue) {
      riskRule.channels.forEach((ch, idx) => {
        const r = openCriticalRisks[0];
        alerts.push({
          id: `alert-risk-${project.id}-${r.id}-${ch.toLowerCase()}`,
          ruleId: riskRule.id,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.code,
          severity: 'CRITICAL',
          title: `[URGENT ESCALATION] ${r.title}`,
          message: `Immediate nodal intervention required: ${r.recommendedAction}`,
          impact: `Critical severity exposure owned by ${r.owner}.`,
          recipient: `${r.owner} Executive Lead`,
          channel: ch,
          dispatchedAt: new Date(Date.now() - (idx * 1000 * 60 * 10)).toISOString(),
          status: 'DELIVERED',
          actionUrl: `/risks`
        });
      });
    }
  }

  cachedDispatchedAlerts = alerts;
  return alerts;
}

export function getDispatchedAlerts(): TriggeredAlert[] {
  if (cachedDispatchedAlerts.length === 0) {
    return evaluateAndGenerateAlerts();
  }
  return cachedDispatchedAlerts;
}

export function triggerInstantAlertScan(): { count: number; timestamp: string; alerts: TriggeredAlert[] } {
  const alerts = evaluateAndGenerateAlerts();
  return {
    count: alerts.length,
    timestamp: new Date().toISOString(),
    alerts
  };
}
