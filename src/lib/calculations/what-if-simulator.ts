import { Project, WhatIfResult } from '@/types';
import { calculateHealthScore } from './health-score';
import { detectBottleneck } from './dependency-graph';

/**
 * What-If Simulation Engine
 * 
 * Recomputes the project health score, schedule health, and expected end date
 * deterministically by mutating the bottleneck's delay in a clone of the project,
 * then re-running the full health score algorithm.
 */
export function simulateBottleneckResolution(
  project: Project,
  targetResolutionDays: number // Slider target: resolve within N days (0 to bottleneckDelay)
): WhatIfResult {
  const currentHealth = calculateHealthScore(project);
  const currentBottleneck = detectBottleneck(project);

  const originalDelay = currentBottleneck.delayDays;
  const originalExpectedEndDate = project.expectedEndDate;

  // If no bottleneck or original delay is 0
  if (!currentBottleneck.bottleneckActivity || originalDelay === 0) {
    return {
      targetResolutionDays,
      originalDelayDays: 0,
      newExpectedDelayDays: 0,
      originalOverallHealth: currentHealth.overallHealth,
      newOverallHealth: currentHealth.overallHealth,
      originalScheduleHealth: currentHealth.scheduleHealth,
      newScheduleHealth: currentHealth.scheduleHealth,
      originalExpectedEndDate,
      newExpectedEndDate: originalExpectedEndDate,
      healthDelta: 0,
      delayDelta: 0,
      isImproved: false
    };
  }

  // Calculate new effective delay for the bottleneck task
  // Target resolution days means: instead of originalDelay days, it will take targetResolutionDays
  const resolvedDelay = Math.max(0, Math.min(originalDelay, targetResolutionDays));
  const delaySaved = Math.max(0, originalDelay - resolvedDelay);

  // Clone project and apply resolved delay to bottleneck activity & downstream items
  const simulatedProject: Project = JSON.parse(JSON.stringify(project));
  
  // Find bottleneck node and update its delayDays
  const bottleneckNode = simulatedProject.dependencies.find(
    d => d.id === currentBottleneck.bottleneckActivity?.id
  );
  if (bottleneckNode) {
    bottleneckNode.delayDays = resolvedDelay;
    if (resolvedDelay === 0) {
      bottleneckNode.status = 'In Progress';
    }
  }

  // Also simulate recovered progress if delay is reduced
  // Every 5 days saved restores ~1.5% progress variance
  const recoveredProgress = Math.min(
    simulatedProject.plannedProgress,
    simulatedProject.progress + (delaySaved * 0.4)
  );
  simulatedProject.progress = Math.round(recoveredProgress * 10) / 10;

  // Calculate new expected end date
  const plannedDateObj = new Date(project.plannedEndDate);
  const originalExpectedObj = new Date(project.expectedEndDate);
  const newExpectedTime = Math.max(
    plannedDateObj.getTime(),
    originalExpectedObj.getTime() - (delaySaved * 24 * 60 * 60 * 1000)
  );
  const newExpectedDateStr = new Date(newExpectedTime).toISOString().split('T')[0];
  simulatedProject.expectedEndDate = newExpectedDateStr;

  // Re-run health calculation over simulated state
  const newHealth = calculateHealthScore(simulatedProject);

  const healthDelta = newHealth.overallHealth - currentHealth.overallHealth;
  const newExpectedDelay = Math.max(0, currentHealth.scheduleVarianceDays - delaySaved);

  return {
    targetResolutionDays,
    originalDelayDays: originalDelay,
    newExpectedDelayDays: newExpectedDelay,
    originalOverallHealth: currentHealth.overallHealth,
    newOverallHealth: newHealth.overallHealth,
    originalScheduleHealth: currentHealth.scheduleHealth,
    newScheduleHealth: newHealth.scheduleHealth,
    originalExpectedEndDate,
    newExpectedEndDate: newExpectedDateStr,
    healthDelta,
    delayDelta: delaySaved,
    isImproved: healthDelta > 0 || delaySaved > 0
  };
}
