import { NextResponse } from 'next/server';
import { validateRoomCode } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;

    // Validar código
    const validation = validateRoomCode(roomCode || '');
    if (!validation.valid) {
      return NextResponse.json(
        { exists: false, error: 'Invalid code', errorKey: validation.errorKey },
        { status: 400 }
      );
    }

    // TODO: Verificar en Vercel KV cuando esté configurado
    // Por ahora, asumimos que la sala puede existir
    // La verificación real se hace en PartyKit

    return NextResponse.json({
      exists: true,
      roomCode: roomCode.toUpperCase()
    });
  } catch (error) {
    console.error('Error checking room:', error);
    return NextResponse.json(
      { exists: false, error: 'Error al verificar la sala' },
      { status: 500 }
    );
  }
}
