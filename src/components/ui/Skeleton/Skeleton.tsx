import type { ComponentPropsWithoutRef } from 'react';
export interface SkeletonProps extends ComponentPropsWithoutRef<'div'> {
  shape?: 'text' | 'image' | 'circle';
}
export function Skeleton({
  shape = 'text',
  className = '',
  ...props
}: SkeletonProps) {
  return (
    <div
      {...props}
      aria-hidden="true"
      className={`skeleton skeleton--${shape} ${className}`}
    />
  );
}
