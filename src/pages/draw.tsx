import { useFormik } from 'formik';
import { sampleSize, uniqueId } from 'lodash';
import { Fragment, useState } from 'react';
import { Button, Card, Container, Form, Row } from 'react-bootstrap';

import { DeckEntry } from '../types';
import { getPageTitle } from '../utils';
import MagicCard from '../components/MagicCard';

function bufferToImageString(buffer: Uint8Array<ArrayBuffer>) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;

  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return `data:image/png;base64,${btoa(binary)}`;
}

export function Component() {
  const [hand, setHand] = useState<DeckEntry[]>([]);
  const { values, handleSubmit, handleChange } = useFormik({
    initialValues: {
      deck: ''
    },
    onSubmit: async ({ deck }) => {
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
        let imageData = new Uint8Array();

        try {
          const imageResponse = await fetch(
            `https://api.scryfall.com/cards/named?exact=${encodeURIComponent(name)}&set=${encodeURIComponent(set.replace(/[()]/g, ''))}&format=image&version=png`
          );

          imageData = await imageResponse.bytes();
        } catch {
          // no-op
          console.error(`Failed to fetch image for ${name}`);
        }

        const newCard = {
          name,
          set,
          image: bufferToImageString(imageData)
        };

        for (let i = 0; i < count; i++) {
          tempDeck.push({
            ...newCard,
            id: uniqueId()
          });
        }
      }

      setHand(sampleSize(tempDeck, 7));
    }
  });

  return (
    <Fragment>
      <title>{getPageTitle('Home')}</title>
      <Card body>
        <Card.Title>Home</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Form.Group>
            <Form.Label>Deck (common format)</Form.Label>
            <Form.Control
              as="textarea"
              name="deck"
              onChange={handleChange}
              rows={6}
              value={values.deck}
            />
          </Form.Group>
          <Form.Group>
            <Button type="submit" variant="primary">
              Draw a Hand
            </Button>
          </Form.Group>
        </Form>
        <Container>
          <Row>
            {hand.map((entry) => (
              <MagicCard image={entry.image} key={entry.id} name={entry.name} />
            ))}
          </Row>
        </Container>
      </Card>
    </Fragment>
  );
}
