import type { ComponentPropsWithoutRef } from 'react';
export interface TypographyProps extends ComponentPropsWithoutRef<'p'> {
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  variant?: 'display' | 'title' | 'heading' | 'body' | 'caption' | 'eyebrow';
}
export function Typography({
  as: Tag = 'p',
  variant = 'body',
  className = '',
  ...props
}: TypographyProps) {
  return (
    <Tag
      {...props}
      className={`typography typography--${variant} ${className}`}
    />
  );
}
