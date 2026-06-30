'use client';

import { PadronImport } from '@/components/admin/PadronImport';

export default function PadronPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Gestión de Padrón</h1>
      <PadronImport />
    </div>
  );
}
