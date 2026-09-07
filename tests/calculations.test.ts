import { describe, it, expect } from 'vitest';
import {
  calculateHealthScore,
  calculateScheduleHealth,
  calculateBudgetHealth,
  calculateMilestoneHealth,
  calculateDependencyHealth,
  calculateRiskHealth,
} from '../src/lib/calculations/health-score';
import {
  detectBottleneck,
  getDownstreamActivities,
} from '../src/lib/calculations/dependency-graph';
import { simulateBottleneckResolution } from '../src/lib/calculations/what-if-simulator';
import { Project } from '../src/types';

// Demo sample project
const sampleDelayedProject: Project = {
  id: 'proj-001',
  code: 'PP-001',
  name: 'East-West Highway Expansion',
  sector: 'Roads',
  location: 'Kolkata',
  manager: 'Suresh Bannerjee',
  budget: 1200,
  spent: 850,
  startDate: '2024-01-01',
  plannedEndDate: '2025-12-31',
  expectedEndDate: '2026-03-31',
  progress: 42,
  plannedProgress: 65,
  milestones: [
    { id: 'm1', name: 'Feasibility & Survey', plannedDate: '2024-03-01', actualDate: '2024-03-01', status: 'Completed', delayDays: 0, owner: 'NHAI' },
    { id: 'm2', name: 'Land Acquisition Clearance', plannedDate: '2024-06-01', status: 'Delayed', delayDays: 28, owner: 'Revenue Dept' },
    { id: 'm3', name: 'Flyover Pier Casting', plannedDate: '2024-11-01', status: 'In Progress', delayDays: 14, owner: 'L&T Infra' },
    { id: 'm4', name: 'Bituminous Pavement Laying', plannedDate: '2025-06-01', status: 'Upcoming', delayDays: 0, owner: 'HCC' }
  ],
  dependencies: [
    { id: 'act-1', name: 'Land Acquisition Clearance', owner: 'Revenue Dept', status: 'Delayed', delayDays: 28, dependsOn: [] },
    { id: 'act-2', name: 'Utility Relocation', owner: 'Electricity Board', status: 'Delayed', delayDays: 14, dependsOn: ['act-1'] },
    { id: 'act-3', name: 'Drainage Culvert Construction', owner: 'PWD', status: 'In Progress', delayDays: 0, dependsOn: ['act-2'] },
    { id: 'act-4', name: 'Main Carriageway Earthwork', owner: 'NHAI', status: 'Upcoming', delayDays: 0, dependsOn: ['act-1'] },
    { id: 'act-5', name: 'Bituminous Surfacing', owner: 'HCC', status: 'Upcoming', delayDays: 0, dependsOn: ['act-3', 'act-4'] }
  ],
  risks: [
    { id: 'r1', title: 'Land acquisition litigation in Sector 4', severity: 'Critical', probability: 'High', impact: 'High', owner: 'Revenue Dept', status: 'Open', recommendedAction: 'Fast-track compensation disbursal via District Magistrate' },
    { id: 'r2', title: 'Monsoon waterlogging near culverts', severity: 'Medium', probability: 'Medium', impact: 'Medium', owner: 'PWD', status: 'Open', recommendedAction: 'Deploy high-capacity dewatering pumps' }
  ],
  departments: ['Revenue Dept', 'Electricity Board', 'PWD', 'NHAI', 'L&T Infra', 'HCC']
};

const sampleGreenProject: Project = {
  id: 'proj-002',
  code: 'PP-002',
  name: 'Central Hospital Construction',
  sector: 'Healthcare',
  location: 'Bhubaneswar',
  manager: 'Dr. Ananya Ray',
  budget: 650,
  spent: 420,
  startDate: '2024-02-01',
  plannedEndDate: '2025-08-30',
  expectedEndDate: '2025-08-30',
  progress: 70,
  plannedProgress: 68,
  milestones: [
    { id: 'm1', name: 'Structural Framing', plannedDate: '2024-08-01', status: 'Completed', delayDays: 0, owner: 'NBCC' },
    { id: 'm2', name: 'MEP Installation', plannedDate: '2024-12-01', status: 'In Progress', delayDays: 0, owner: 'Voltas' }
  ],
  dependencies: [
    { id: 'd1', name: 'Site Handover', owner: 'Health Dept', status: 'Completed', delayDays: 0, dependsOn: [] },
    { id: 'd2', name: 'Structural Work', owner: 'NBCC', status: 'In Progress', delayDays: 0, dependsOn: ['d1'] }
  ],
  risks: [
    { id: 'r1', title: 'Medical equipment delivery delay', severity: 'Low', probability: 'Low', impact: 'Medium', owner: 'Procurement', status: 'Open', recommendedAction: 'Confirm dispatch dates' }
  ],
  departments: ['Health Dept', 'NBCC', 'Voltas']
};

describe('NEXORA Health Score Algorithm', () => {
  it('computes exact health scores and correct status bands', () => {
    const delayedHealth = calculateHealthScore(sampleDelayedProject);
    expect(delayedHealth.overallHealth).toBeLessThan(60);
    expect(delayedHealth.status).toBe('DELAYED');
    expect(delayedHealth.scheduleVariancePercentage).toBe(-23);

    const greenHealth = calculateHealthScore(sampleGreenProject);
    expect(greenHealth.overallHealth).toBeGreaterThanOrEqual(80);
    expect(greenHealth.status).toBe('ON TRACK');
  });

  it('correctly weighs the 5 components: Schedule 30%, Budget 20%, Milestone 20%, Dependency 15%, Risk 15%', () => {
    const health = calculateHealthScore(sampleDelayedProject);
    const expected = Math.round(
      health.scheduleHealth * 0.30 +
      health.budgetHealth * 0.20 +
      health.milestoneHealth * 0.20 +
      health.dependencyHealth * 0.15 +
      health.riskHealth * 0.15
    );
    expect(health.overallHealth).toBe(expected);
  });
});

describe('NEXORA Dependency & Bottleneck Engine', () => {
  it('traverses DAG to find all transitive downstream blocked activities', () => {
    // act-1 blocks act-2, act-4 directly, and act-3, act-5 transitively (total 4 downstream activities)
    const downstream = getDownstreamActivities('act-1', sampleDelayedProject.dependencies);
    const downstreamIds = downstream.map(d => d.id);

    expect(downstream.length).toBe(4);
    expect(downstreamIds).toContain('act-2');
    expect(downstreamIds).toContain('act-3');
    expect(downstreamIds).toContain('act-4');
    expect(downstreamIds).toContain('act-5');
  });

  it('detects the primary bottleneck as the node blocking the highest downstream work', () => {
    const bottleneck = detectBottleneck(sampleDelayedProject);

    expect(bottleneck.bottleneckActivity?.id).toBe('act-1');
    expect(bottleneck.blockedActivityCount).toBe(4);
    expect(bottleneck.department).toBe('Revenue Dept');
    expect(bottleneck.priority).toBe('CRITICAL');
    expect(bottleneck.plainStatement).toContain('blocking 4 downstream activities');
  });
});

describe('NEXORA What-If Simulation Engine', () => {
  it('recalculates health score, delay days, and completion date deterministically on slider change', () => {
    // Current bottleneck is 28 days delayed. Target: resolve within 5 days.
    const sim = simulateBottleneckResolution(sampleDelayedProject, 5);

    expect(sim.targetResolutionDays).toBe(5);
    expect(sim.originalDelayDays).toBe(28);
    expect(sim.delayDelta).toBe(23); // 28 - 5 = 23 days saved
    expect(sim.newOverallHealth).toBeGreaterThan(sim.originalOverallHealth);
    expect(sim.newScheduleHealth).toBeGreaterThan(sim.originalScheduleHealth);
    expect(sim.isImproved).toBe(true);
    expect(sim.newExpectedEndDate).not.toBe(sim.originalExpectedEndDate);
  });
});
