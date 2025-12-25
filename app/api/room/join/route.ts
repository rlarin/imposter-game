import { NextResponse } from 'next/server';
import { validatePlayerName, validateRoomCode, generatePlayerId } from '@/lib/utils';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { playerName, roomCode } = body;

    // Validar nombre
    const nameValidation = validatePlayerName(playerName || '');
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid name', errorKey: nameValidation.errorKey },
        { status: 400 }
      );
    }

    // Validar código
    const codeValidation = validateRoomCode(roomCode || '');
    if (!codeValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid code', errorKey: codeValidation.errorKey },
        { status: 400 }
      );
    }

    // TODO: Verificar que la sala existe en Vercel KV cuando esté configurado
    // Por ahora, la verificación se hace en PartyKit al conectarse

    // Generar ID para el jugador
    const playerId = generatePlayerId();

    return NextResponse.json({
      playerId,
      roomCode: roomCode.toUpperCase(),
      message: 'Listo para unirse'
    });
  } catch (error) {
    console.error('Error joining room:', error);
    return NextResponse.json(
      { error: 'Error al unirse a la sala' },
      { status: 500 }
    );
  }
}
