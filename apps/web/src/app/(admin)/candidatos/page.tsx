'use client';

import { CandidateList } from '@/components/admin/CandidateList';

export default function CandidatesPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gestión de Candidatos</h1>
      <CandidateList />
    </div>
  );
}
