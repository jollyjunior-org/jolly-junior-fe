import React from 'react';
import { useRouter } from 'next/navigation';
import { BrandLogo } from './BrandLogo';

export const StandaloneHeader: React.FC = () => {
  const router = useRouter();

  const handleNavigateHome = () => {
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-[#D9F1F5] flex justify-center py-4">
      <BrandLogo size="md" onNavigateHome={handleNavigateHome} />
    </header>
  );
};
