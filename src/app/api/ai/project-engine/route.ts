import { NextRequest, NextResponse } from 'next/server';
import { getProjectById } from '@/lib/db/store';
import { queryDeterministicEngine } from '@/lib/ai/deterministic-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, question } = body;

    if (!projectId || !question) {
      return NextResponse.json({ error: 'Missing projectId or question in payload' }, { status: 400 });
    }

    const project = getProjectById(projectId);
    if (!project) {
      return NextResponse.json({ error: `Project not found with id: ${projectId}` }, { status: 404 });
    }

    const response = queryDeterministicEngine(project, question);

    return NextResponse.json({
      success: true,
      projectId,
      question,
      ...response
    });
  } catch (error) {
    console.error('Error in project-engine query:', error);
    return NextResponse.json({ error: 'Failed to process AI engine query' }, { status: 500 });
  }
}
