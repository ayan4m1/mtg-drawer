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

import { DeckEntry, DisplayModes } from '../types';
import { getPageTitle } from '../utils';
import MagicCard from '../components/MagicCard';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faImages,
  faListDots,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';

function bufferToImageString(buffer: Uint8Array<ArrayBuffer>) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return `data:image/png;base64,${btoa(binary)}`;
}

type FormSchema = {
  deck: string;
};

export function Component() {
  const [displayMode, setDisplayMode] = useState<DisplayModes>(
    DisplayModes.Images
  );
  const imageMap = useRef<Map<string, string>>(new Map());
  const [activeKey, setActiveKey] = useState('deck');
  const [loading, setLoading] = useState(false);
  const [hand, setHand] = useState<DeckEntry[]>([]);
  const { errors, values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      deck: ''
    },
    validate: ({ deck }) => {
      const result: FormikErrors<FormSchema> = {};

      if (!deck) {
        result.deck = 'Deck cannot be empty!';
      }

      return result;
    },
    onSubmit: async ({ deck }) => {
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
        let image = '';

        if (imageMap.current.has(`${name} ${set}`)) {
          image = imageMap.current.get(`${name} ${set}`);
        } else {
          try {
            const imageResponse = await fetch(
              `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}&set=${encodeURIComponent(set.replace(/[()]/g, ''))}&format=image&version=png`
            );

            image = bufferToImageString(await imageResponse.bytes());
            imageMap.current.set(`${name} ${set}`, image);
          } catch {
            // no-op
            console.error(`Failed to fetch image for ${name}`);
          }
        }

        const newCard = {
          name,
          set,
          image
        };

        for (let i = 0; i < count; i++) {
          tempDeck.push({
            ...newCard,
            id: uniqueId()
          });
        }
      }

      setHand(() => {
        setLoading(false);
        return sampleSize(tempDeck, 7);
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
                <Form.Label>Paste Decklist w/ Set IDs</Form.Label>
                <Form.Group>
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
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          <Form.Group className="my-2">
            <Button type="submit" variant="primary">
              Draw a Hand
            </Button>
          </Form.Group>
        </Form>
        <Container>
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
            ) : (
              hand.map((entry) =>
                displayMode === DisplayModes.Images ? (
                  <MagicCard
                    image={entry.image}
                    key={entry.id}
                    name={entry.name}
                  />
                ) : (
                  <Col key={entry.id} xs={12}>
                    {entry.name} {entry.set.toLocaleUpperCase()}
                  </Col>
                )
              )
            )}
          </Row>
        </Container>
      </Card>
    </Fragment>
  );
}
