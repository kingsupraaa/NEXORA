import { NextRequest, NextResponse } from 'next/server';
import { importProjectsBulk } from '@/lib/db/store';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projects, source } = body;

    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return NextResponse.json({ error: 'No projects provided in payload' }, { status: 400 });
    }

    const validProjects = projects.map((p, idx) => ({
      name: p.name || `Imported Capital Project ${idx + 1}`,
      code: p.code,
      sector: p.sector || 'Roads',
      location: p.location || 'Delhi',
      manager: p.manager || 'Executive Engineer',
      budget: Number(p.budget || 500),
      spent: Number(p.spent || 100),
      startDate: p.startDate || '2024-01-01',
      plannedEndDate: p.plannedEndDate || '2026-12-31',
      expectedEndDate: p.expectedEndDate || p.plannedEndDate || '2026-12-31',
      progress: Number(p.progress || 25),
      plannedProgress: Number(p.plannedProgress || 35),
      description: p.description || `Ingested from ${source || 'External Gateway'}`,
      milestones: p.milestones || [],
      dependencies: p.dependencies || [],
      risks: p.risks || [],
      departments: p.departments || [`${p.sector || 'Infrastructure'} Dept`]
    }));

    const imported = importProjectsBulk(validProjects);

    return NextResponse.json({
      success: true,
      importedCount: imported.length,
      source: source || 'External Telemetry',
      projects: imported
    });
  } catch (err) {
    console.error('Error importing projects:', err);
    return NextResponse.json({ error: 'Failed to import projects' }, { status: 500 });
  }
}
