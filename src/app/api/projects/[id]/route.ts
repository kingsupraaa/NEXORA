import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '@/lib/db/store';
import { calculateHealthScore } from '@/lib/calculations/health-score';
import { detectBottleneck, getDependencyChains } from '@/lib/calculations/dependency-graph';
import { generateRiskExplanation } from '@/lib/ai/risk-explainer';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = getProjectById(params.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const health = calculateHealthScore(project);
    const bottleneck = detectBottleneck(project);
    const dependencyChains = getDependencyChains(project.dependencies);
    const explanation = await generateRiskExplanation(project);

    return NextResponse.json({
      project,
      health,
      bottleneck,
      dependencyChains,
      explanation
    });
  } catch (error) {
    console.error('Error fetching project detail:', error);
    return NextResponse.json({ error: 'Failed to fetch project detail' }, { status: 500 });
  }
}
