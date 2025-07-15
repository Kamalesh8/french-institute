import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    // Path to the demo data
    const dataPath = path.join(process.cwd(), 'src/data/courses.json');

    // Check if the file exists
    if (!fs.existsSync(dataPath)) {
      return NextResponse.json(
        { error: 'Demo data not found' },
        { status: 404 }
      );
    }

    // Read the file
    const jsonData = fs.readFileSync(dataPath, 'utf8');
    const courses = JSON.parse(jsonData);

    return NextResponse.json(courses);
  } catch (error) {
    console.error('Error reading demo courses data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demo courses' },
      { status: 500 }
    );
  }
}

