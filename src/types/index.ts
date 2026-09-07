export type ProjectSector =
  | 'Roads'
  | 'Railways'
  | 'Metro'
  | 'Healthcare'
  | 'Water'
  | 'Energy'
  | 'Education'
  | 'Urban Development'
  | 'Manufacturing'
  | 'IT';

export type ProjectLocation =
  | 'Kolkata'
  | 'Delhi'
  | 'Mumbai'
  | 'Bengaluru'
  | 'Chennai'
  | 'Hyderabad'
  | 'Pune'
  | 'Bhubaneswar'
  | 'Guwahati'
  | 'Ahmedabad'
  | 'Jaipur'
  | 'Lucknow';

export type ProjectStatus = 'ON TRACK' | 'AT RISK' | 'DELAYED';
export type MilestoneStatus = 'Completed' | 'In Progress' | 'Delayed' | 'Upcoming';
export type DependencyStatus = 'Completed' | 'In Progress' | 'Delayed' | 'Upcoming';
export type RiskSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type RiskStatus = 'Open' | 'Mitigating' | 'Resolved' | 'Escalated';

export interface Milestone {
  id: string;
  name: string;
  plannedDate: string; // YYYY-MM-DD
  actualDate?: string;
  status: MilestoneStatus;
  delayDays: number;
  owner: string;
}

export interface ActivityDependency {
  id: string;
  name: string;
  owner: string;
  status: DependencyStatus;
  delayDays: number;
  dependsOn: string[]; // IDs of preceding activities this activity depends upon
  durationDays?: number;
  startDate?: string;
  endDate?: string;
}

export interface ProjectRisk {
  id: string;
  title: string;
  severity: RiskSeverity;
  probability: 'High' | 'Medium' | 'Low';
  impact: 'High' | 'Medium' | 'Low';
  owner: string;
  status: RiskStatus;
  recommendedAction: string;
  assignedTo?: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  sector: ProjectSector;
  location: ProjectLocation;
  manager: string;
  budget: number; // in INR Crores
  spent: number; // in INR Crores
  startDate: string;
  plannedEndDate: string;
  expectedEndDate: string;
  progress: number; // 0 to 100
  plannedProgress: number; // 0 to 100
  milestones: Milestone[];
  dependencies: ActivityDependency[];
  risks: ProjectRisk[];
  departments: string[];
  description?: string;
}

export interface HealthScoreBreakdown {
  scheduleHealth: number; // 0-100 (weight 0.30)
  budgetHealth: number; // 0-100 (weight 0.20)
  milestoneHealth: number; // 0-100 (weight 0.20)
  dependencyHealth: number; // 0-100 (weight 0.15)
  riskHealth: number; // 0-100 (weight 0.15)
  overallHealth: number; // 0-100 weighted
  status: ProjectStatus;
  scheduleVarianceDays: number;
  scheduleVariancePercentage: number;
  budgetUtilizationPercentage: number;
  budgetOverrunFlag: 'Normal' | 'High' | 'Critical Overrun';
}

export interface BottleneckAnalysis {
  bottleneckActivity: ActivityDependency | null;
  delayDays: number;
  blockedActivityCount: number;
  blockedActivities: ActivityDependency[];
  department: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  impactStatement: string;
  plainStatement: string;
}

export interface WhatIfResult {
  targetResolutionDays: number;
  originalDelayDays: number;
  newExpectedDelayDays: number;
  originalOverallHealth: number;
  newOverallHealth: number;
  originalScheduleHealth: number;
  newScheduleHealth: number;
  originalExpectedEndDate: string;
  newExpectedEndDate: string;
  healthDelta: number;
  delayDelta: number;
  isImproved: boolean;
}

export interface AIExplanationResult {
  isAI: boolean;
  projectSummary: string;
  reasons: string[];
  recommendedPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedAction: string;
  timestamp: string;
}

export interface ActionItem {
  id: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  title: string;
  type: 'BOTTLENECK' | 'RISK';
  severity: RiskSeverity;
  departmentOrOwner: string;
  impact: string;
  recommendedAction: string;
  status: 'Open' | 'Assigned' | 'Escalated' | 'Resolved';
  assignedTo?: string;
  escalatedTo?: string;
  updatedAt: string;
}

export interface PortfolioMetrics {
  totalProjects: number;
  onTrackCount: number;
  atRiskCount: number;
  delayedCount: number;
  totalBudget: number;
  totalSpent: number;
  averageUtilization: number;
  criticalRisksCount: number;
  overallHealthScore: number;
  overallStatus: ProjectStatus;
  healthBreakdown: {
    scheduleHealth: number;
    budgetHealth: number;
    milestoneHealth: number;
    dependencyHealth: number;
    riskHealth: number;
  };
  highestRiskProject: {
    project: Project;
    health: HealthScoreBreakdown;
    bottleneck: BottleneckAnalysis;
    explanation: string;
  } | null;
}

export type AlertChannel = 'EMAIL' | 'WHATSAPP' | 'SMS' | 'WEBHOOK';
export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  thresholdType: 'SCHEDULE_SLIP' | 'BOTTLENECK_BLOCKED' | 'BUDGET_OVERRUN' | 'CRITICAL_RISK';
  thresholdValue: number;
  channels: AlertChannel[];
  targetRoles: string[];
  isEnabled: boolean;
}

export interface TriggeredAlert {
  id: string;
  ruleId: string;
  projectId: string;
  projectName: string;
  projectCode: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  impact: string;
  recipient: string;
  channel: AlertChannel;
  dispatchedAt: string;
  status: 'DELIVERED' | 'READ' | 'PENDING' | 'FAILED';
  actionUrl: string;
}
