import type { ComponentPropsWithoutRef, Ref } from 'react';
export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'secondary';
  ref?: Ref<HTMLButtonElement>;
}
export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      className={`button button--${variant} ${className}`}
    />
  );
}

export interface ButtonLinkProps extends ComponentPropsWithoutRef<'a'> {
  variant?: 'primary' | 'secondary';
}
/** A link styled as an action, preserving navigation semantics. */
export function ButtonLink({
  variant = 'primary',
  className = '',
  ...props
}: ButtonLinkProps) {
  return <a {...props} className={`button button--${variant} ${className}`} />;
}
