import React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';

const experimentMap: Record<string, any> = {
  'bernoulli': dynamic(() => import('../../../components/simulations/fluid/bernoulli'), { ssr: false }),
  'reynolds': dynamic(() => import('../../../components/simulations/fluid/reynolds'), { ssr: false }),
  'venturimeter': dynamic(() => import('../../../components/simulations/fluid/venturimeter'), { ssr: false }),
  'hydraulic-jump': dynamic(() => import('../../../components/simulations/fluid/hydraulic-jump'), { ssr: false }),
  'weir': dynamic(() => import('../../../components/simulations/fluid/weir'), { ssr: false }),
  'pipe-friction': dynamic(() => import('../../../components/simulations/fluid/pipe-friction'), { ssr: false }),
  'boundary-layer': dynamic(() => import('../../../components/simulations/fluid/boundary-layer'), { ssr: false }),
};

export default function FluidExperimentPage() {
  const router = useRouter();
  const { experiment } = router.query;
  const ExpComp = typeof experiment === 'string' && experimentMap[experiment];

  return (
    <div className="p-8">
      {ExpComp ? <ExpComp /> : <div>Experiment not found.</div>}
    </div>
  );
}
