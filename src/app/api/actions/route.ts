import { NextRequest, NextResponse } from 'next/server';
import { getAllActionItems, updateActionItem } from '@/lib/db/store';

export async function GET() {
  try {
    const items = getAllActionItems();
    return NextResponse.json({ actions: items });
  } catch (error) {
    console.error('Error fetching action items:', error);
    return NextResponse.json({ error: 'Failed to fetch action items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { actionId, status, assignedTo, escalatedTo } = body;

    if (!actionId || !status) {
      return NextResponse.json({ error: 'actionId and status are required' }, { status: 400 });
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
    console.error('Error updating action item:', error);
    return NextResponse.json({ error: 'Failed to update action item' }, { status: 500 });
  }
}
