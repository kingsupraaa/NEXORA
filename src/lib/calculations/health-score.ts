import { Project, HealthScoreBreakdown, ProjectStatus } from '@/types';

/**
 * Health Score Algorithm (Exact formula per NEXORA specification)
 * 
 * Schedule Health    (weight 0.30)
 * Budget Health       (weight 0.20)
 * Milestone Health    (weight 0.20)
 * Dependency Health   (weight 0.15)
 * Risk Health         (weight 0.15)
 * 
 * Overall = Schedule*0.30 + Budget*0.20 + Milestone*0.20 + Dependency*0.15 + Risk*0.15
 * 
 * Status bands:
 *  - 80-100: "ON TRACK" (GREEN)
 *  - 60-79:  "AT RISK"  (AMBER)
 *  - 0-59:   "DELAYED"  (RED)
 */

export function calculateScheduleHealth(project: Project): { score: number; varianceDays: number; variancePct: number } {
  const variancePct = Math.round((project.progress - project.plannedProgress) * 10) / 10;
  
  // Calculate approximate schedule variance in days based on project timeline
  const start = new Date(project.startDate).getTime();
  const plannedEnd = new Date(project.plannedEndDate).getTime();
  const expectedEnd = new Date(project.expectedEndDate).getTime();
  
  const totalPlannedDays = Math.max(1, Math.round((plannedEnd - start) / (1000 * 60 * 60 * 24)));
  const expectedDelayDays = Math.max(0, Math.round((expectedEnd - plannedEnd) / (1000 * 60 * 60 * 24)));
  
  // Score based on progress variance and expected delay
  let score = 100;
  if (variancePct < 0) {
    // e.g. -15% variance => 100 - (15 * 2.2) = 67
    score += variancePct * 2.2;
  } else {
    // Slightly reward ahead of schedule up to 100
    score = Math.min(100, 100 + variancePct * 0.5);
  }

  // Factor in milestone delay days
  const delayedMilestones = project.milestones.filter(m => m.status === 'Delayed' || m.delayDays > 0);
  const maxMilestoneDelay = delayedMilestones.length > 0 ? Math.max(...delayedMilestones.map(m => m.delayDays)) : 0;
  
  if (maxMilestoneDelay > 0) {
    score -= Math.min(25, maxMilestoneDelay * 0.6);
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    varianceDays: expectedDelayDays,
    variancePct
  };
}

export function calculateBudgetHealth(project: Project): { score: number; utilizationPct: number; overrunFlag: 'Normal' | 'High' | 'Critical Overrun' } {
  if (project.budget <= 0) {
    return { score: 100, utilizationPct: 0, overrunFlag: 'Normal' };
  }
  
  const utilizationPct = Math.round((project.spent / project.budget) * 100 * 10) / 10;
  const progress = project.progress;
  
  // Spend vs progress variance
  const spendOverProgress = utilizationPct - progress;
  let score = 100;
  
  if (spendOverProgress > 25) {
    score = Math.max(20, 100 - (spendOverProgress * 1.6));
  } else if (spendOverProgress > 10) {
    score = Math.max(50, 100 - (spendOverProgress * 1.3));
  } else if (spendOverProgress > 0) {
    score = Math.max(70, 100 - (spendOverProgress * 1.0));
  }

  // Utilization flags
  let overrunFlag: 'Normal' | 'High' | 'Critical Overrun' = 'Normal';
  if (utilizationPct > 100 || (utilizationPct > 85 && progress < 60)) {
    overrunFlag = 'Critical Overrun';
    score = Math.min(score, 45);
  } else if (utilizationPct > 85 || spendOverProgress > 15) {
    overrunFlag = 'High';
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(score))),
    utilizationPct,
    overrunFlag
  };
}

export function calculateMilestoneHealth(project: Project): number {
  if (!project.milestones || project.milestones.length === 0) return 100;
  
  const total = project.milestones.length;
  const delayed = project.milestones.filter(m => m.status === 'Delayed' || m.delayDays > 0);
  const inProgress = project.milestones.filter(m => m.status === 'In Progress');
  const completed = project.milestones.filter(m => m.status === 'Completed');

  if (delayed.length === 0) {
    return 100;
  }

  // Base proportion of non-delayed milestones
  const nonDelayedRatio = (total - delayed.length) / total;
  let score = nonDelayedRatio * 100;

  // Extra penalty for severe delay days
  const totalDelayDays = delayed.reduce((sum, m) => sum + m.delayDays, 0);
  const avgDelay = totalDelayDays / delayed.length;
  
  score -= Math.min(25, avgDelay * 0.5);

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateDependencyHealth(project: Project): number {
  if (!project.dependencies || project.dependencies.length === 0) return 100;

  const total = project.dependencies.length;
  const delayedDeps = project.dependencies.filter(d => d.status === 'Delayed' || d.delayDays > 0);

  if (delayedDeps.length === 0) return 100;

  let penalty = 0;
  // Compute downstream blocked count for each delayed dependency
  for (const dep of delayedDeps) {
    // find how many activities depend on this delayed activity
    const blockedCount = project.dependencies.filter(d => 
      d.dependsOn.includes(dep.id) && d.status !== 'Completed'
    ).length;

    penalty += 12 + (blockedCount * 8) + Math.min(15, dep.delayDays * 0.4);
  }

  const score = Math.max(0, 100 - penalty);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateRiskHealth(project: Project): number {
  if (!project.risks || project.risks.length === 0) return 100;

  const activeRisks = project.risks.filter(r => r.status !== 'Resolved');
  if (activeRisks.length === 0) return 100;

  let totalPenalty = 0;
  for (const risk of activeRisks) {
    let penalty = 0;
    if (risk.severity === 'Critical') penalty = 24;
    else if (risk.severity === 'High') penalty = 14;
    else if (risk.severity === 'Medium') penalty = 7;
    else penalty = 3;

    if (risk.probability === 'High') penalty *= 1.2;
    if (risk.impact === 'High') penalty *= 1.2;

    totalPenalty += penalty;
  }

  const score = Math.max(0, 100 - totalPenalty);
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateHealthScore(project: Project): HealthScoreBreakdown {
  const scheduleRes = calculateScheduleHealth(project);
  const budgetRes = calculateBudgetHealth(project);
  const milestoneScore = calculateMilestoneHealth(project);
  const dependencyScore = calculateDependencyHealth(project);
  const riskScore = calculateRiskHealth(project);

  // Exact weights: 0.30, 0.20, 0.20, 0.15, 0.15
  const overall = (
    scheduleRes.score * 0.30 +
    budgetRes.score * 0.20 +
    milestoneScore * 0.20 +
    dependencyScore * 0.15 +
    riskScore * 0.15
  );

  const roundedOverall = Math.round(overall);

  let status: ProjectStatus = 'ON TRACK';
  if (roundedOverall < 60) {
    status = 'DELAYED';
  } else if (roundedOverall < 80) {
    status = 'AT RISK';
  }

  return {
    scheduleHealth: scheduleRes.score,
    budgetHealth: budgetRes.score,
    milestoneHealth: milestoneScore,
    dependencyHealth: dependencyScore,
    riskHealth: riskScore,
    overallHealth: roundedOverall,
    status,
    scheduleVarianceDays: scheduleRes.varianceDays,
    scheduleVariancePercentage: scheduleRes.variancePct,
    budgetUtilizationPercentage: budgetRes.utilizationPct,
    budgetOverrunFlag: budgetRes.overrunFlag
  };
}
