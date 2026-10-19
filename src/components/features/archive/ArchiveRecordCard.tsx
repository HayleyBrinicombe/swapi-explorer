import { useState } from 'react';
import {
  MdPublic,
  MdMovie,
  MdRocketLaunch,
  MdDirectionsCar,
} from 'react-icons/md';
import type { RelatedRecord } from '../../../../shared/contracts';
import {
  getResourceImage,
  type ResourceKind,
} from '../../../assets/resourceImages';
import { Card } from '../../ui/Card/Card';
export function ArchiveRecordCard({
  record,
  kind,
  headingLevel = 4,
}: {
  record: RelatedRecord;
  kind: ResourceKind;
  headingLevel?: 2 | 4;
}) {
  const Heading = headingLevel === 2 ? 'h2' : 'h4';
  const [failed, setFailed] = useState(false);
  const image = getResourceImage(kind, record.id);
  const Icon = {
    planets: MdPublic,
    films: MdMovie,
    starships: MdRocketLaunch,
    vehicles: MdDirectionsCar,
  }[kind];
  return (
    <Card className={`connection-card connection-card--${kind}`}>
      <div className="connection-image">
        {image && !failed ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            width={kind === 'films' ? '400' : '640'}
            height={kind === 'films' ? '600' : '360'}
            onError={() => setFailed(true)}
          />
        ) : (
          <Icon size={48} aria-hidden="true" />
        )}
      </div>
      <div className="connection-copy">
        <p className="eyebrow">{record.subtitle}</p>
        <Heading className="archive-record-title">{record.name}</Heading>
        <dl>
          {record.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
}
