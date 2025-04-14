import { NextResponse } from 'next/server';

export async function POST() {
  //   const formData = await req.formData();

  // Pretty log
  //   await logFormData(formData);

  // TODO: handle saving the data to DB or file storage

  return NextResponse.json({ success: true });
}
// async function logFormData(formData: FormData) {
//   const entries: Record<string, any> = {};

//   for (const [key, value] of formData.entries()) {
//     if (value instanceof File) {
//       entries[key] = {
//         filename: value.name,
//         type: value.type,
//         size: value.size + ' bytes',
//       };
//     } else {
//       try {
//         // Try to parse JSON fields like tags, variantOptions, etc.
//         entries[key] = JSON.parse(value as string);
//       } catch {
//         entries[key] = value;
//       }
//     }
//   }

//   console.log('📝 Received Form Data:\n' + JSON.stringify(entries, null, 2));
// }
