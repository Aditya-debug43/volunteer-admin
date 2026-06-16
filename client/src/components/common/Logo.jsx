import { useState } from 'react';
import { SITE_IMAGES } from '@/constants/images';

export default function Logo({ withTagline = false, className = '' }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {imgOk ? (
        <img
          src={SITE_IMAGES.logo}
          alt="NayePankh Foundation"
          className="h-10 w-10 rounded-full object-contain"
          onError={() => setImgOk(false)}
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
          NP
        </div>
      )}
      <div>
        <p className="text-lg font-extrabold leading-none text-ink">NayePankh</p>
        {withTagline && <p className="text-xs text-ink-soft">Giving Wings to the Underprivileged</p>}
      </div>
    </div>
  );
}
