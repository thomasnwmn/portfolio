import { InteractiveDesk } from '../components/scene/InteractiveDesk';
import { HUD } from '../components/ui/HUD';
import { OverlayManager } from '../components/ui/OverlayManager';
import { BootSequence } from '../components/animations/BootSequence';

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden bg-slate-950">
      <BootSequence>
        <InteractiveDesk />
        <HUD />
        <OverlayManager />
      </BootSequence>
    </main>
  );
}
