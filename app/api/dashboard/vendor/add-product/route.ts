import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const parsedData: Record<string, any> = {};

    for (const [key, value] of formData.entries()) {
      const isFile = value instanceof File;

      // Normalize key (strip trailing [] if present)
      const cleanKey = key.endsWith('[]') ? key.slice(0, -2) : key;

      if (isFile) {
        const fileInfo = {
          filename: value.name,
          type: value.type,
          size: value.size,
        };

        if (parsedData[cleanKey]) {
          parsedData[cleanKey].push(fileInfo);
        } else {
          parsedData[cleanKey] = [fileInfo];
        }
      } else {
        let parsedValue: any;
        const valStr = value as string;

        try {
          parsedValue = JSON.parse(valStr);
        } catch {
          parsedValue = valStr;
        }

        if (parsedData[cleanKey]) {
          // If key already exists, turn into array
          if (!Array.isArray(parsedData[cleanKey])) {
            parsedData[cleanKey] = [parsedData[cleanKey]];
          }
          parsedData[cleanKey].push(parsedValue);
        } else {
          parsedData[cleanKey] = parsedValue;
        }
      }
    }

    console.log('📝 Parsed Form Data:\n' + JSON.stringify(parsedData, null, 2));

    await new Promise((resolve) => setTimeout(resolve, 2000));
    return NextResponse.json('Success', { status: 200 });
  } catch (error) {
    console.error('❌ Error parsing form data:', error);
    return NextResponse.json('Internal Server Error', { status: 500 });
  }
}
