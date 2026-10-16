import { Card } from '../../ui/Card/Card';
import { Skeleton } from '../../ui/Skeleton/Skeleton';
import { VStack } from '../../ui/Stack/Stack';
export function CharacterGridSkeleton() {
  return (
    <div className="character-grid skeleton-grid" aria-hidden="true">
      {Array.from({ length: 4 }, (_, index) => (
        <Card key={index} className="character-card">
          <Skeleton shape="image" />
          <VStack gap={3} className="card-body">
            <Skeleton />
            <Skeleton className="skeleton-short" />
          </VStack>
        </Card>
      ))}
    </div>
  );
}
