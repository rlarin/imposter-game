import { NextResponse } from 'next/server';
import { createRoom } from '@/lib/game-logic';
import { validatePlayerName } from '@/lib/utils';
import { incrementTotalRoomsCreated, registerRoom } from '@/lib/kv';

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

    // Guardar sala en Upstash Redis
    await registerRoom({
      roomCode: room.roomCode,
      hostName: playerName.trim(),
      playerCount: room.players.length,
      connectedPlayers: room.players.filter((p) => p.isConnected).length,
      phase: room.phase,
      createdAt: Date.now(),
      lastHeartbeat: Date.now(),
    });

    // Incrementar contador de salas creadas
    await incrementTotalRoomsCreated();

    return NextResponse.json({
      roomCode: room.roomCode,
      playerId,
      message: 'Sala creada exitosamente',
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Error al crear la sala' }, { status: 500 });
  }
}
