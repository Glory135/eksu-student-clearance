import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'EKSU Clearance API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      message: 'Test endpoint working',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
} 