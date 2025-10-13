import { Fragment, useState } from 'react';
import { Button, Col, Row } from 'react-bootstrap';

import { DeckEntry, DisplayModes } from '../types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MagicCard from './MagicCard';
import { faImages, faListDots } from '@fortawesome/free-solid-svg-icons';

interface IProps {
  hand: DeckEntry[];
}

export default function MagicHand({ hand }: IProps) {
  const [displayMode, setDisplayMode] = useState(DisplayModes.Images);

  return (
    <Fragment>
      <Row>
        <Col className="text-end" xs={12}>
          <Button
            onClick={() => setDisplayMode(DisplayModes.Images)}
            variant="outline-secondary"
          >
            <FontAwesomeIcon icon={faImages} size="2x" />
          </Button>
          <Button
            onClick={() => setDisplayMode(DisplayModes.List)}
            variant="outline-secondary"
          >
            <FontAwesomeIcon icon={faListDots} size="2x" />
          </Button>
        </Col>
      </Row>
      <Row>
        {hand.map((entry) =>
          displayMode === DisplayModes.Images ? (
            <MagicCard key={entry.id} {...entry} />
          ) : (
            <Col key={entry.id} xs={12}>
              {entry.name} {entry.set.toLocaleUpperCase()}
            </Col>
          )
        )}
      </Row>
    </Fragment>
  );
}
