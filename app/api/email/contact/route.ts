import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { z } from 'zod';

import { contactTemplate } from '@/lib/email-template/contact-template';

const contactSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, phoneNumber, message } = contactSchema.parse(body);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Oylkka" <${process.env.SMTP_SENDER}>`,
      to: 'oylkka5@gmail.com',
      subject: 'New Contact Form Submission',
      html: contactTemplate({ username, email, phoneNumber, message }),
    });

    return NextResponse.json(
      { message: 'Email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
