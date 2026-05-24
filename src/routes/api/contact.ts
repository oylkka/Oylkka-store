import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/api/contact')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { name, email, subject, message } = body;

          if (!name || !email || !message) {
            return Response.json(
              { error: 'Name, email, and message are required' },
              { status: 400 },
            );
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return Response.json(
              { error: 'Invalid email address' },
              { status: 400 },
            );
          }

          return Response.json(
            {
              message: 'Contact message received successfully',
              data: { name, email, subject, message },
            },
            { status: 200 },
          );
        } catch (error) {
          return Response.json(
            {
              error:
                error instanceof Error
                  ? error.message
                  : 'Internal Server Error',
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
