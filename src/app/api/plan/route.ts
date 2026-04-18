import { NextRequest, NextResponse } from 'next/server';
import { planAndExecute } from '../../../ai/dev';

export async function POST(request: NextRequest) {
  try {
    const { goal } = await request.json();

    if (!goal || typeof goal !== 'string' || !goal.trim()) {
      return NextResponse.json({ error: 'Goal is required' }, { status: 400 });
    }

    const result = await planAndExecute(goal.trim());

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process goal';
    console.error('Error running plan:', message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}