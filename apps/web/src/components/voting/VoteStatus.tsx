import { CheckCircle, Loader2 } from 'lucide-react';

interface VoteStatusProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  txHash?: string;
}

export const VoteStatus = ({ status, message, txHash }: VoteStatusProps) => {
  if (status === 'idle') return null;

  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      {status === 'loading' && <Loader2 className="w-16 h-16 animate-spin text-blue-500" />}
      {status === 'success' && <CheckCircle className="w-16 h-16 text-green-500" />}
      {status === 'error' && <div className="w-16 h-16 flex items-center justify-center text-red-500">❌</div>}
      <p className="text-lg font-medium text-center">
        {message || (status === 'success' ? '¡Voto registrado exitosamente!' : status === 'loading' ? 'Procesando voto...' : 'Error al registrar el voto')}
      </p>
      {txHash && (
        <p className="text-sm text-gray-500 break-all">
          Tx: {txHash}
        </p>
      )}
    </div>
  );
};
