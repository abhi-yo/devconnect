// This route is deprecated, redirecting to the Pages API implementation for Socket.IO
export const runtime = 'nodejs';

export async function GET(req: Request) {
  return new Response(
    JSON.stringify({ 
      message: 'Socket.IO server has moved to /api/socketio',
      status: 'redirected'
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
} 