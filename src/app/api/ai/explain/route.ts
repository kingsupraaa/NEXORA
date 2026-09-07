import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '@/lib/db/store';
import { generateRiskExplanation } from '@/lib/ai/risk-explainer';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
    }

    const project = getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const explanation = await generateRiskExplanation(project);
    return NextResponse.json(explanation);
  } catch (error) {
    console.error('Error generating AI explanation:', error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}
