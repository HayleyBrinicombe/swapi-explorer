import type { ComponentPropsWithoutRef } from 'react';
/** A visual surface; navigation and document semantics belong to its composition. */
export function Card({
  className = '',
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={`card ${className}`} />;
}
