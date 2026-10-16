import type { ComponentPropsWithoutRef } from 'react';
export function Container({
  className = '',
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div {...props} className={`container ${className}`} />;
}
