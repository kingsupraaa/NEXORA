import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, getPortfolioMetrics, createProject } from '@/lib/db/store';
import { calculateHealthScore } from '@/lib/calculations/health-score';
import { detectBottleneck } from '@/lib/calculations/dependency-graph';

export async function GET() {
  try {
    const projects = getAllProjects();
    const enriched = projects.map(p => {
      const health = calculateHealthScore(p);
      const bottleneck = detectBottleneck(p);
      return {
        ...p,
        health,
        bottleneck
      };
    });

    const metrics = getPortfolioMetrics();
    return NextResponse.json({ projects: enriched, metrics });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, sector, location, manager, budget, spent, startDate, plannedEndDate, expectedEndDate, progress, plannedProgress, description, initialMilestone, initialRisk } = body;

    if (!name || !sector || !location || !manager || budget === undefined) {
      return NextResponse.json({ error: 'Missing required project fields: name, sector, location, manager, budget' }, { status: 400 });
    }

    const start = startDate || new Date().toISOString().split('T')[0];
    const plannedEnd = plannedEndDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const expectedEnd = expectedEndDate || plannedEnd;

    const milestones = [];
    if (initialMilestone) {
      milestones.push({
        id: `m-init-1`,
        name: initialMilestone.name || 'Site Survey & Statutory Clearance',
        plannedDate: initialMilestone.plannedDate || plannedEnd,
        status: initialMilestone.status || 'In Progress',
        delayDays: Number(initialMilestone.delayDays || 0),
        owner: initialMilestone.owner || manager
      });
    } else {
      milestones.push({
        id: `m-init-1`,
        name: 'Phase 1 Land Handover & Foundation',
        plannedDate: plannedEnd,
        status: 'In Progress',
        delayDays: 0,
        owner: manager
      });
    }

    const dependencies = [
      {
        id: 'act-init-1',
        name: 'Site Mobilization & Approvals',
        owner: manager,
        status: 'In Progress' as const,
        delayDays: 0,
        dependsOn: []
      },
      {
        id: 'act-init-2',
        name: 'Main Civil Execution',
        owner: 'Primary Contractor',
        status: 'Upcoming' as const,
        delayDays: 0,
        dependsOn: ['act-init-1']
      }
    ];

    const risks = [];
    if (initialRisk) {
      risks.push({
        id: `r-init-1`,
        title: initialRisk.title || `Clearance coordination with ${sector} Dept`,
        severity: initialRisk.severity || 'Medium',
        probability: initialRisk.probability || 'Medium',
        impact: initialRisk.impact || 'Medium',
        owner: initialRisk.owner || manager,
        status: 'Open' as const,
        recommendedAction: initialRisk.recommendedAction || 'Schedule weekly inter-agency alignment review'
      });
    }

    const created = createProject({
      name,
      code: body.code,
      sector,
      location,
      manager,
      budget: Number(budget),
      spent: Number(spent || 0),
      startDate: start,
      plannedEndDate: plannedEnd,
      expectedEndDate: expectedEnd,
      progress: Number(progress || 0),
      plannedProgress: Number(plannedProgress || 10),
      milestones,
      dependencies,
      risks,
      departments: [sector + ' Dept', 'Contractor Cell'],
      description: description || `Newly assigned infrastructure project in ${location} for ${sector} sector operations.`
    });

    const health = calculateHealthScore(created);
    const bottleneck = detectBottleneck(created);

    return NextResponse.json({
      success: true,
      project: {
        ...created,
        health,
        bottleneck
      }
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}
