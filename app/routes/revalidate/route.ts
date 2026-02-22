import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { tag } = await request.json();
    await revalidateTag(tag, 'default');
    return NextResponse.json({ revalidated: true });
  } catch (error) {
    return NextResponse.json({ revalidated: false }, { status: 500 });
  }
}
