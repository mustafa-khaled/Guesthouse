import { Button } from '@/components/ui/button';
import { Container } from '@/components/ui/container';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] max-w-2xl flex-col items-start justify-center py-20">
      <p aria-hidden className="text-brand/40 tabular font-serif text-6xl leading-none">
        404
      </p>
      <h1 className="text-title mt-4 text-balance">Page not found</h1>
      <p className="text-muted mt-3 max-w-md text-pretty leading-relaxed">
        The page you are looking for has moved or never existed. The garden is still open — let us
        point you somewhere quiet.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/">Back to home</Button>
        <Button href="/search" variant="secondary">
          Find a stay
        </Button>
      </div>
    </Container>
  );
}
