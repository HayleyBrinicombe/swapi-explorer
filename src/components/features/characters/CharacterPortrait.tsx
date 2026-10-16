import { useState } from 'react';
import { getPortraitUrl } from '../../../assets/portraits';
export function CharacterPortrait({
  id,
  name,
  eager = false,
}: {
  id: string;
  name: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const src = getPortraitUrl(id);
  return (
    <div className="portrait">
      {src && !failed ? (
        <img
          src={src}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          width="400"
          height="550"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="portrait-fallback" aria-hidden="true">
          <span>
            {name
              .split(/[\s-]+/)
              .slice(0, 2)
              .map((word) => word[0])
              .join('')}
          </span>
          <small>Portrait unavailable</small>
        </div>
      )}
    </div>
  );
}
