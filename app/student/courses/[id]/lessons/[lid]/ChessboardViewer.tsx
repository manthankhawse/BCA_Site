'use client';
import dynamic from 'next/dynamic';

const Chessboard = dynamic(() => import('react-chessboard').then(m => m.Chessboard), { ssr: false });

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export default function ChessboardViewer({ fen }: { fen?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
        <div className="w-full max-w-[480px]">
          <Chessboard
            {...({
              position: fen || START_FEN,
              arePiecesDraggable: false,
              customBoardStyle: { borderRadius: '8px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)' },
              customDarkSquareStyle: { backgroundColor: '#2d4a22' },
              customLightSquareStyle: { backgroundColor: '#f0d9b5' }
            } as any)}
          />
      </div>
      {fen && (
        <p className="text-gray-600 text-xs font-mono break-all max-w-md text-center">{fen}</p>
      )}
    </div>
  );
}
