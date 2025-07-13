import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const experimentMap: Record<string, any> = {
  'slider-crank': dynamic(() => import('../../../components/simulations/kom/slider-crank'), { ssr: false }),
  'four-bar-linkage': dynamic(() => import('../../../components/simulations/kom/four-bar-linkage'), { ssr: false }),
  'gear-train': dynamic(() => import('../../../components/simulations/kom/gear-train'), { ssr: false }),
  'cam-follower': dynamic(() => import('../../../components/simulations/kom/cam-follower'), { ssr: false }),
  'geneva': dynamic(() => import('../../../components/simulations/kom/geneva'), { ssr: false }),
  'belt-drive': dynamic(() => import('../../../components/simulations/kom/belt-drive'), { ssr: false }),
  'flywheel': dynamic(() => import('../../../components/simulations/kom/flywheel'), { ssr: false }),
};

export default function KomExperimentPage() {
  const router = useRouter();
  const { experiment } = router.query;
  const ExpComp = typeof experiment === 'string' && experimentMap[experiment];

  return (
    <div className="p-8">
      {ExpComp ? <ExpComp /> : <div>Experiment not found.</div>}
    </div>
  );
}
