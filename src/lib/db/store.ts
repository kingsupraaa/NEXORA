import fs from 'fs';
import path from 'path';
import { Project, PortfolioMetrics, ActionItem, ProjectRisk } from '@/types';
import { INITIAL_PROJECTS } from '@/lib/data/mock-projects';
import { calculateHealthScore } from '@/lib/calculations/health-score';
import { detectBottleneck } from '@/lib/calculations/dependency-graph';

const DB_FILE = path.join(process.cwd(), 'data-store.json');

interface DatabaseSchema {
  projects: Project[];
  actionOverrides: Record<string, { status: 'Open' | 'Assigned' | 'Escalated' | 'Resolved'; assignedTo?: string; escalatedTo?: string; updatedAt: string }>;
  lastUpdated: string;
}

function getDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading data-store.json, resetting to default', err);
  }

  const initial: DatabaseSchema = {
    projects: INITIAL_PROJECTS,
    actionOverrides: {},
    lastUpdated: new Date().toISOString()
  };
  saveDatabase(initial);
  return initial;
}

function saveDatabase(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to data-store.json', err);
  }
}


export function createProject(projectData: Omit<Project, 'id'> & { id?: string }): Project {
  const db = getDatabase();
  const nextNum = db.projects.length + 1;
  const numStr = nextNum < 10 ? '00' + nextNum : (nextNum < 100 ? '0' + nextNum : '' + nextNum);
  
  const newProject: Project = {
    ...projectData,
    id: projectData.id || `proj-${numStr}`,
    code: projectData.code || `PP-${numStr}`,
    milestones: projectData.milestones || [],
    dependencies: projectData.dependencies || [],
    risks: projectData.risks || [],
    departments: projectData.departments || [projectData.sector + ' Dept'],
    description: projectData.description || `Infrastructure asset assigned in ${projectData.location} for ${projectData.sector}.`
  };

  db.projects.unshift(newProject);
  db.lastUpdated = new Date().toISOString();
  saveDatabase(db);
  return newProject;
}

export function getAllProjects(): Project[] {
  const db = getDatabase();
  return db.projects;
}

export function getProjectById(id: string): Project | null {
  const db = getDatabase();
  return db.projects.find(p => p.id === id || p.code.toLowerCase() === id.toLowerCase()) || null;
}

export function getAllActionItems(): ActionItem[] {
  const db = getDatabase();
  const actions: ActionItem[] = [];

  for (const project of db.projects) {
    const bottleneck = detectBottleneck(project);
    if (bottleneck.bottleneckActivity && bottleneck.delayDays > 0) {
      const actionId = `action-bn-${project.id}-${bottleneck.bottleneckActivity.id}`;
      const override = db.actionOverrides[actionId];
      
      actions.push({
        id: actionId,
        projectId: project.id,
        projectName: project.name,
        projectCode: project.code,
        title: `Land approval pending with ${bottleneck.department}`,
        type: 'BOTTLENECK',
        severity: bottleneck.priority === 'CRITICAL' ? 'Critical' : (bottleneck.priority === 'HIGH' ? 'High' : 'Medium'),
        departmentOrOwner: bottleneck.department,
        impact: `Critical severity risk × Recommended: Escalate to department head immediately`,
        recommendedAction: `Escalate to department head immediately`,
        status: override ? override.status : 'Open',
        assignedTo: override?.assignedTo,
        escalatedTo: override?.escalatedTo,
        updatedAt: override?.updatedAt || new Date().toISOString()
      });
    }

    for (const risk of project.risks) {
      if (risk.severity === 'Critical' || risk.severity === 'High') {
        const actionId = `action-risk-${project.id}-${risk.id}`;
        const override = db.actionOverrides[actionId];

        actions.push({
          id: actionId,
          projectId: project.id,
          projectName: project.name,
          projectCode: project.code,
          title: risk.title,
          type: 'RISK',
          severity: risk.severity,
          departmentOrOwner: risk.owner,
          impact: `${risk.severity} severity risk × Recommended: ${risk.recommendedAction}`,
          recommendedAction: risk.recommendedAction,
          status: override ? override.status : (risk.status === 'Resolved' ? 'Resolved' : 'Open'),
          assignedTo: override?.assignedTo,
          escalatedTo: override?.escalatedTo,
          updatedAt: override?.updatedAt || new Date().toISOString()
        });
      }
    }
  }

  // Sort critical first, then open/escalated first
  return actions.sort((a, b) => {
    if (a.severity === 'Critical' && b.severity !== 'Critical') return -1;
    if (b.severity === 'Critical' && a.severity !== 'Critical') return 1;
    if (a.status === 'Open' && b.status === 'Resolved') return -1;
    if (b.status === 'Open' && a.status === 'Resolved') return 1;
    return 0;
  });
}

export function updateActionItem(
  actionId: string,
  update: { status: 'Open' | 'Assigned' | 'Escalated' | 'Resolved'; assignedTo?: string; escalatedTo?: string }
): ActionItem | null {
  const db = getDatabase();
  db.actionOverrides[actionId] = {
    status: update.status,
    assignedTo: update.assignedTo,
    escalatedTo: update.escalatedTo,
    updatedAt: new Date().toISOString()
  };

  // If this action was linked to a risk, update the risk in project
  if (actionId.includes('-risk-')) {
    const parts = actionId.split('-');
    const projId = parts[2];
    const riskId = parts[3];
    const proj = db.projects.find(p => p.id === projId);
    if (proj) {
      const risk = proj.risks.find(r => r.id === riskId);
      if (risk) {
        risk.status = update.status === 'Resolved' ? 'Resolved' : (update.status === 'Escalated' ? 'Escalated' : 'Mitigating');
        if (update.assignedTo) risk.assignedTo = update.assignedTo;
      }
    }
  }

  saveDatabase(db);
  const items = getAllActionItems();
  return items.find(i => i.id === actionId) || null;
}

export function getPortfolioMetrics(): PortfolioMetrics {
  const projects = getAllProjects();
  let onTrack = 0;
  let atRisk = 0;
  let delayed = 0;
  let totalBudget = 0;
  let totalSpent = 0;
  let criticalRisksCount = 0;

  let sumSchedule = 0;
  let sumBudget = 0;
  let sumMilestone = 0;
  let sumDependency = 0;
  let sumRisk = 0;
  let sumOverall = 0;

  let highestRiskProject: {
    project: Project;
    health: any;
    bottleneck: any;
    explanation: string;
  } | null = null;
  let minHealthScore = 999;

  for (const p of projects) {
    const health = calculateHealthScore(p);
    const bottleneck = detectBottleneck(p);

    if (health.status === 'ON TRACK') onTrack++;
    else if (health.status === 'AT RISK') atRisk++;
    else delayed++;

    totalBudget += p.budget;
    totalSpent += p.spent;

    const criticalInProj = p.risks.filter(r => r.severity === 'Critical' && r.status !== 'Resolved').length;
    criticalRisksCount += criticalInProj;

    sumSchedule += health.scheduleHealth;
    sumBudget += health.budgetHealth;
    sumMilestone += health.milestoneHealth;
    sumDependency += health.dependencyHealth;
    sumRisk += health.riskHealth;
    sumOverall += health.overallHealth;

    if (health.overallHealth < minHealthScore) {
      minHealthScore = health.overallHealth;
      highestRiskProject = {
        project: p,
        health,
        bottleneck,
        explanation: `${bottleneck.department} is delayed by ${bottleneck.delayDays} days, blocking ${bottleneck.blockedActivityCount} downstream activities.`
      };
    }
  }

  const count = Math.max(1, projects.length);
  const avgOverall = Math.round(sumOverall / count);

  let overallStatus: 'ON TRACK' | 'AT RISK' | 'DELAYED' = 'ON TRACK';
  if (avgOverall < 60) overallStatus = 'DELAYED';
  else if (avgOverall < 80) overallStatus = 'AT RISK';

  return {
    totalProjects: projects.length,
    onTrackCount: onTrack,
    atRiskCount: atRisk,
    delayedCount: delayed,
    totalBudget,
    totalSpent,
    averageUtilization: Math.round((totalSpent / totalBudget) * 100),
    criticalRisksCount,
    overallHealthScore: avgOverall,
    overallStatus,
    healthBreakdown: {
      scheduleHealth: Math.round(sumSchedule / count),
      budgetHealth: Math.round(sumBudget / count),
      milestoneHealth: Math.round(sumMilestone / count),
      dependencyHealth: Math.round(sumDependency / count),
      riskHealth: Math.round(sumRisk / count)
    },
    highestRiskProject
  };
}
