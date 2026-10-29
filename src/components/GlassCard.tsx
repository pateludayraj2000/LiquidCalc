import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  subtle?: boolean;
  withSpecular?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  subtle = false,
  withSpecular = true,
  ...props
}) => {
  return (
    <div
      className={`relative rounded-3xl overflow-hidden transition-all duration-200 ${
        subtle ? 'liquid-glass-subtle' : 'liquid-glass'
      } ${className}`}
      {...props}
    >
      {withSpecular && <div className="specular-rim" />}
      {children}
    </div>
  );
};
