import type { ComponentPropsWithoutRef, CSSProperties } from 'react';
type Spacing = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
export interface StackProps extends ComponentPropsWithoutRef<'div'> {
  gap?: Spacing;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between';
  wrap?: boolean;
}
function Stack({
  direction,
  gap = 3,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  className = '',
  style,
  ...props
}: StackProps & { direction: 'row' | 'column' }) {
  return (
    <div
      {...props}
      className={`stack stack--${direction} ${className}`}
      style={
        {
          '--stack-gap': `var(--space-${gap})`,
          '--stack-align': align,
          '--stack-justify': justify === 'between' ? 'space-between' : justify,
          '--stack-wrap': wrap ? 'wrap' : 'nowrap',
          ...style,
        } as CSSProperties
      }
    />
  );
}
export function HStack(props: StackProps) {
  return <Stack direction="row" {...props} />;
}
export function VStack(props: StackProps) {
  return <Stack direction="column" {...props} />;
}
