import { NextRequest, NextResponse } from 'next/server';
import { getAllActionItems, getActionItemsForProject, createProjectActionItem, updateActionItem } from '@/lib/db/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const items = projectId ? getActionItemsForProject(projectId) : getAllActionItems();
    return NextResponse.json({ actions: items });
  } catch (error) {
    console.error('Error fetching action items:', error);
    return NextResponse.json({ error: 'Failed to fetch action items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Case 1: Create a new project task assigned to someone
    if (body.title && body.projectId) {
      const { projectId, title, assignedTo, severity, departmentOrOwner, impact, recommendedAction, dueDate } = body;

      if (!assignedTo) {
        return NextResponse.json({ error: 'assignedTo person is required to assign a task' }, { status: 400 });
      }

      const newTask = createProjectActionItem({
        projectId,
        title,
        assignedTo,
        severity: severity || 'Medium',
        departmentOrOwner,
        impact,
        recommendedAction,
        dueDate
      });

      return NextResponse.json({ success: true, action: newTask });
    }

    // Case 2: Update an existing action/task status or assignment
    const { actionId, status, assignedTo, escalatedTo } = body;

    if (!actionId || !status) {
      return NextResponse.json({ error: 'actionId and status are required for updating' }, { status: 400 });
    }

    const updated = updateActionItem(actionId, {
      status,
      assignedTo,
      escalatedTo
    });

    if (!updated) {
      return NextResponse.json({ error: 'Action item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, action: updated });
  } catch (error) {
    console.error('Error handling action item request:', error);
    return NextResponse.json({ error: 'Failed to process action item' }, { status: 500 });
  }
}
