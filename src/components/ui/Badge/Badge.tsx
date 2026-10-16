import type { ComponentPropsWithoutRef } from 'react';
export interface BadgeProps extends ComponentPropsWithoutRef<'span'> {
  tone?: 'accent' | 'glass';
}
export function Badge({
  tone = 'accent',
  className = '',
  ...props
}: BadgeProps) {
  return <span {...props} className={`badge badge--${tone} ${className}`} />;
}
