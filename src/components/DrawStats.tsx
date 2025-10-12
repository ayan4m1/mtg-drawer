import { useMemo } from 'react';
import { Col, ListGroup, Row } from 'react-bootstrap';

import { DeckEntry, ManaColors } from '../types';

interface IProps {
  hands: DeckEntry[][];
}

export default function DrawStats({ hands }: IProps) {
  const colors = useMemo<Map<ManaColors, number>>(() => {
    const result = new Map<ManaColors, number>();

    for (const hand of hands) {
      for (const card of hand) {
        for (const [value, key] of Object.entries(ManaColors)) {
          if (!card.color.includes(ManaColors[value])) {
            continue;
          }

          console.dir(`${card.name} is ${value}`);

          if (!result.has(key)) {
            result.set(key, 0);
          }

          result.set(key, result.get(key) + 1);
        }
      }
    }

    return result;
  }, [hands]);

  return hands.length ? (
    <Row className="my-2">
      <Col xs={12}>
        <h4>{hands.length} Draws</h4>
        <ListGroup>
          {Object.entries(ManaColors).map(([key, val]) => (
            <ListGroup.Item key={key}>
              {key} - {colors.get(val) ?? '0'}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Col>
    </Row>
  ) : null;
}
