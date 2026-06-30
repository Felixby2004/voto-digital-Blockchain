'use client';

import { VoteStatus } from '@/components/voting/VoteStatus';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function ConfirmationPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
      <VoteStatus status="success" message="¡Tu voto ha sido registrado exitosamente en la blockchain!" />
      <Link href="/">
        <Button>Volver al Inicio</Button>
      </Link>
    </div>
  );
}
