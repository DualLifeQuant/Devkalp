import { useNavigate, useLocation, useParams as useRouterParams, useSearchParams as useReactRouterSearchParams } from 'react-router-dom';

export function useRouter() {
  const navigate = useNavigate();
  return {
    push: (href: string) => navigate(href),
    replace: (href: string) => navigate(href, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => window.location.reload(),
    prefetch: () => {},
  };
}

export function usePathname() {
  const location = useLocation();
  return location.pathname;
}

export function useSearchParams() {
  const [searchParams] = useReactRouterSearchParams();
  return searchParams;
}

export function useParams() {
  return useRouterParams();
}
