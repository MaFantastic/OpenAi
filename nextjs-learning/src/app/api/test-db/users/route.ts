import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

import { db } from '@/lib/db';
import { users } from '@/lib/schema';

/**
 * Inserts two sample users to quickly verify the DB / Drizzle wiring.
 * Hit with POST /api/test-db/users.
 */
export async function POST() {
  try {
    const sampleUsers = [
      {
        id: randomUUID(),
        username: 'test_user_1',
        email: 'test_user_1@example.com',
        intro: 'First seeded user for API test.',
      },
      {
        id: randomUUID(),
        username: 'test_user_2',
        email: 'test_user_2@example.com222',
        intro: 'Second seeded user for API test.',
      },
    ];

    const insertedUsers = await db.insert(users).values(sampleUsers).returning();

    return NextResponse.json({ data: insertedUsers }, { status: 201 });
  } catch (error) {
    console.error('Failed to insert sample users', error);
    return NextResponse.json(
      { error: 'Failed to insert sample users' },
      { status: 500 },
    );
  }
}

