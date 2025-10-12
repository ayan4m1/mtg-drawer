import pluralize from 'pluralize';
import { FormikErrors, useFormik } from 'formik';
import { sampleSize, uniqueId } from 'lodash';
import { Fragment, useRef, useState } from 'react';
import {
  Accordion,
  Button,
  Card,
  Col,
  Container,
  Form,
  Row
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImages,
  faListDots,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

import MagicCard from '../components/MagicCard';
import DrawStats from '../components/DrawStats';
import { CardInfoResponse, DeckEntry, DisplayModes } from '../types';
import { getPageTitle } from '../utils';

type FormSchema = {
  deck: string;
};

export function Component() {
  const [displayMode, setDisplayMode] = useState<DisplayModes>(
    DisplayModes.Images
  );
  const cardInfoMap = useRef<Map<string, CardInfoResponse>>(new Map());
  const [activeKey, setActiveKey] = useState('deck');
  const [loading, setLoading] = useState(false);
  const [hands, setHands] = useState<DeckEntry[][]>([]);
  const { errors, values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      deck: '',
      drawCount: 1
    },
    validate: ({ deck }) => {
      const result: FormikErrors<FormSchema> = {};

      if (!deck) {
        result.deck = 'Deck cannot be empty!';
      }

      return result;
    },
    onSubmit: async ({ deck, drawCount }) => {
      setLoading(true);
      setActiveKey('');

      const tempDeck: DeckEntry[] = [];
      const cards = deck.split('\n').map((line) => line.trim().split(/\s+/));

      for (const card of cards) {
        const [rawCount, ...rest] = card;
        const [set, ...names] = rest.reverse();
        const count = parseInt(rawCount, 10);

        if (isNaN(count)) {
          continue;
        }

        const name = names.reverse().join(' ');
        let cardInfo: CardInfoResponse = null;

        if (cardInfoMap.current.has(`${name} ${set}`)) {
          cardInfo = cardInfoMap.current.get(`${name} ${set}`);
        } else {
          try {
            const cardInfoResponse = await fetch(
              `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}&set=${encodeURIComponent(set.replace(/[()]/g, ''))}`
            );
            cardInfo =
              (await cardInfoResponse.json()) as unknown as CardInfoResponse;

            cardInfoMap.current.set(`${name} ${set}`, cardInfo);
          } catch {
            // no-op
            console.error(`Failed to fetch card info for ${name}`);
          }
        }

        const newCard = {
          name,
          set,
          image: cardInfo.image_uris?.png,
          color: cardInfo.color_identity?.join?.('') ?? '',
          type: cardInfo.type_line
        };

        if (!newCard.type) {
          console.assert(`TYPE LINE IS UNDEFINED FOR ${newCard.name}`);
        }

        for (let i = 0; i < count; i++) {
          tempDeck.push({
            ...newCard,
            id: uniqueId()
          });
        }
      }

      setHands((hands) => {
        const result = [...hands];

        setLoading(false);

        for (let i = 0; i < drawCount; i++) {
          result.push(sampleSize(tempDeck, 7));
        }

        return result;
      });
    }
  });

  return (
    <Fragment>
      <title>{getPageTitle('Home')}</title>
      <Card body>
        <Card.Title>Home</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Accordion activeKey={activeKey}>
            <Accordion.Item
              eventKey="deck"
              onClick={() => setActiveKey('deck')}
            >
              <Accordion.Header>Settings</Accordion.Header>
              <Accordion.Body>
                <Form.Group>
                  <Form.Label>Paste Decklist w/ Set IDs</Form.Label>
                  <Form.Control
                    as="textarea"
                    isInvalid={Boolean(errors.deck)}
                    name="deck"
                    onChange={handleChange}
                    rows={10}
                    value={values.deck}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.deck}
                  </Form.Control.Feedback>
                </Form.Group>
                <Form.Group>
                  <Form.Label>Hands to Draw</Form.Label>
                  <Form.Control
                    isInvalid={Boolean(errors.drawCount)}
                    min={1}
                    name="drawCount"
                    onChange={handleChange}
                    step={1}
                    type="number"
                    value={values.drawCount}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.drawCount}
                  </Form.Control.Feedback>
                </Form.Group>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          <Form.Group className="my-2">
            <Button type="submit" variant="primary">
              Draw {values.drawCount} {pluralize('Hand', values.drawCount)}
            </Button>
          </Form.Group>
        </Form>
        <Container>
          <DrawStats hands={hands} />
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
            {loading ? (
              <FontAwesomeIcon icon={faSpinner} size="3x" spin />
            ) : hands.length ? (
              hands[hands.length - 1].map((entry) =>
                displayMode === DisplayModes.Images ? (
                  <MagicCard key={entry.id} {...entry} />
                ) : (
                  <Col key={entry.id} xs={12}>
                    {entry.name} {entry.set.toLocaleUpperCase()}
                  </Col>
                )
              )
            ) : null}
          </Row>
        </Container>
      </Card>
    </Fragment>
  );
}
