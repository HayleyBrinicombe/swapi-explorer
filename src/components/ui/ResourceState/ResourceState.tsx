import { Button } from '../Button/Button';
import { MdErrorOutline } from 'react-icons/md';
export function ResourceState({
  message,
  retry,
}: {
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="resource-state" role={message ? 'alert' : 'status'}>
      <span className={message ? 'state-symbol' : 'scanner'} aria-hidden="true">
        {message ? <MdErrorOutline size={24} /> : ''}
      </span>
      <h2>{message ? 'Transmission interrupted' : 'Accessing the archive'}</h2>
      <p>{message ?? 'Retrieving records from a galaxy far, far away…'}</p>
      {retry && <Button onClick={retry}>Try again</Button>}
    </div>
  );
}
