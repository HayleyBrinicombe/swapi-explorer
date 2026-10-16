import { MdArrowForward } from 'react-icons/md';
import { formatMeasurement } from './characterFormatting';
import { Card } from '../../ui/Card/Card';
import { Badge } from '../../ui/Badge/Badge';
import { HStack } from '../../ui/Stack/Stack';
import { Typography } from '../../ui/Typography/Typography';
import type { Character } from '../../../../shared/contracts';
import { CharacterPortrait } from './CharacterPortrait';
export function CharacterCard({
  character,
  onNavigate,
}: {
  character: Character;
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  return (
    <a
      className="character-link"
      href={`?character=${character.id}`}
      onClick={(event) => onNavigate(event, character.id)}
    >
      <Card className="character-card">
        <div className="card-image">
          <CharacterPortrait id={character.id} name={character.name} />
          <div className="card-reveal" aria-hidden="true">
            <div className="card-preview-facts">
              <span>
                <small>Height</small>
                {formatMeasurement(character.height, 'cm')}
              </span>
              <span>
                <small>Mass</small>
                {formatMeasurement(character.mass, 'kg')}
              </span>
            </div>
            <span className="card-preview-action">
              View character <MdArrowForward size={18} />
            </span>
          </div>
          <Badge tone="glass" className="record-number">
            No. {character.id.padStart(3, '0')}
          </Badge>
        </div>
        <div className="card-body">
          <Typography as="h3" variant="heading">
            {character.name}
          </Typography>
          <HStack
            gap={3}
            justify="between"
            align="center"
            className="card-meta"
          >
            <span>
              {character.birthYear === 'unknown'
                ? 'Birth year unknown'
                : `Born ${character.birthYear}`}
            </span>
            <span>
              {character.filmCount}{' '}
              {character.filmCount === 1 ? 'film' : 'films'}
            </span>
          </HStack>
        </div>
      </Card>
    </a>
  );
}
