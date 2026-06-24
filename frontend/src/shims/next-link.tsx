import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, replace, scroll, prefetch, children, ...props }, ref) => {
    const isExternal = href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:') || href.startsWith('tel:');
    
    if (isExternal) {
      return (
        <a href={href} ref={ref} {...props}>
          {children}
        </a>
      );
    }

    return (
      <RouterLink to={href} replace={replace} ref={ref} {...props}>
        {children}
      </RouterLink>
    );
  }
);

Link.displayName = 'Link';

export default Link;
