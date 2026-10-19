import {
  MdArrowForward,
  MdPublic,
  MdMovie,
  MdRocketLaunch,
  MdRadar,
} from 'react-icons/md';
import {
  getResourceImage,
  type ResourceKind,
} from '../../../assets/resourceImages';
import { Card } from '../../ui/Card/Card';

// Editorial entry points into real character connections, not separate resource browsers.
const previews = [
  {
    kind: 'planets',
    id: '1',
    category: 'Homeworlds',
    name: 'Tatooine',
    description: 'Discover the world Luke calls home.',
    target: 'homeworld-title',
    Icon: MdPublic,
  },
  {
    kind: 'films',
    id: '1',
    category: 'Films',
    name: 'A New Hope',
    description: "Follow Luke's story across the saga.",
    target: 'films-title',
    Icon: MdMovie,
  },
  {
    kind: 'starships',
    id: '12',
    category: 'Starships',
    name: 'X-wing',
    description: 'Meet the craft behind the adventures.',
    target: 'starships-title',
    Icon: MdRocketLaunch,
  },
  {
    kind: 'vehicles',
    id: '14',
    category: 'Vehicles',
    name: 'Snowspeeder',
    description: "Explore Luke's journeys on the ground.",
    target: 'vehicles-title',
    Icon: MdRadar,
  },
] satisfies {
  kind: ResourceKind;
  id: string;
  category: string;
  name: string;
  description: string;
  target: string;
  Icon: typeof MdPublic;
}[];

export function GalaxyDiscovery({
  onNavigate,
}: {
  onNavigate: (event: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  return (
    <section
      id="galaxy-discovery"
      className="galaxy-discovery"
      aria-labelledby="discovery-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Beyond the character</p>
          <h2 id="discovery-title">
            Explore their galaxy<span className="heading-dot">.</span>
          </h2>
        </div>
        <a className="text-link" href="#records">
          Browse characters <MdArrowForward aria-hidden="true" />
        </a>
      </div>
      <p className="discovery-description">
        Every character connects to a bigger story. Start with Luke's homeworld,
        films and iconic craft.
      </p>
      <div className="discovery-grid">
        {previews.map(
          ({ kind, id, category, name, description, target, Icon }) => (
            <a
              className={`discovery-link discovery-link--${kind}`}
              key={kind}
              href={`?character=1#${target}`}
              onClick={(event) => onNavigate(event, '1')}
            >
              <Card className="discovery-card">
                <div className="discovery-image">
                  <img
                    src={getResourceImage(kind, id)}
                    alt=""
                    width="640"
                    height="360"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.hidden = true;
                    }}
                  />
                  <Icon className="discovery-symbol" aria-hidden="true" />
                </div>
                <div className="discovery-copy">
                  <p className="eyebrow">{category}</p>
                  <h3>{name}</h3>
                  <p>{description}</p>
                  <span className="discovery-action">
                    Explore {category.toLowerCase()}{' '}
                    <MdArrowForward aria-hidden="true" />
                  </span>
                </div>
              </Card>
            </a>
          ),
        )}
      </div>
    </section>
  );
}
