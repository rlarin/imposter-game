import { NextResponse } from 'next/server';
import { createRoom } from '@/lib/game-logic';
import { validatePlayerName } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerName } = body;

    // Validar nombre
    const validation = validatePlayerName(playerName || '');
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid name', errorKey: validation.errorKey },
        { status: 400 }
      );
    }

    // Crear sala
    const { room, playerId } = createRoom(playerName.trim());

    // TODO: Guardar sala en Vercel KV cuando esté configurado
    // Por ahora, la sala se mantiene solo en PartyKit

    return NextResponse.json({
      roomCode: room.roomCode,
      playerId,
      message: 'Sala creada exitosamente'
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Error al crear la sala' },
      { status: 500 }
    );
  }
}
