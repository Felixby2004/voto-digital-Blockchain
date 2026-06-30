'use client';

import { ElectionForm } from '@/components/admin/ElectionForm';

export default function CreateElectionPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Crear Nueva Elección</h1>
      <ElectionForm />
    </div>
  );
}
