import pluralize from 'pluralize';
import { FormikErrors, useFormik } from 'formik';
import { sampleSize, uniqueId } from 'lodash';
import { Fragment, useCallback, useRef, useState, DragEvent } from 'react';
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
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

import MagicHand from '../components/MagicHand';
import DrawStats from '../components/DrawStats';
import { CardInfoResponse, DeckEntry } from '../types';
import { getPageTitle } from '../utils';

type FormSchema = {
  deck: string;
  drawCount: number;
};

export function Component() {
  const cardInfoMap = useRef<Map<string, CardInfoResponse>>(new Map());
  const [activeKey, setActiveKey] = useState('deck');
  const [loading, setLoading] = useState(false);
  const [hands, setHands] = useState<DeckEntry[][]>([]);
  const [dragging, setDragging] = useState(false);
  const [dropError, setDropError] = useState(false);
  const { errors, values, handleSubmit, handleChange, setFieldValue } =
    useFormik({
      initialValues: {
        deck: '',
        drawCount: 1
      },
      validate: ({ deck, drawCount }) => {
        const result: FormikErrors<FormSchema> = {};

        if (!deck) {
          result.deck = 'Deck cannot be empty!';
        }

        if (isNaN(drawCount) || drawCount < 1 || drawCount > 10000) {
          result.drawCount = 'Draw count must be between 1 and 10k';
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
            image: cardInfo?.image_uris?.png,
            color: cardInfo?.color_identity?.join?.('') ?? '',
            type: cardInfo?.type_line
          };

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
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
    setDropError(false);
  }, []);
  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setDragging(false);

      const { files } = e.dataTransfer;

      if (files.length !== 1) {
        setDropError(true);
        return;
      }

      const [file] = files;

      if (!file.type.startsWith('text/')) {
        setDropError(true);
        return;
      }

      const reader = new FileReader();

      reader.onload = (readEvent) =>
        setFieldValue('deck', readEvent.target.result);
      reader.onerror = () => setDropError(true);

      reader.readAsText(file, 'utf-8');
    },
    [setFieldValue]
  );
  const handleDragExit = useCallback(() => setDragging(false), []);

  return (
    <Fragment>
      <title>{getPageTitle('Draw Hands')}</title>
      <Card body>
        <Card.Title>Draw Hands</Card.Title>
        <Form onSubmit={handleSubmit}>
          <Accordion activeKey={activeKey}>
            <Accordion.Item
              eventKey="deck"
              onClick={() => setActiveKey('deck')}
            >
              <Accordion.Header>Settings</Accordion.Header>
              <Accordion.Body>
                <Form.Group>
                  <Form.Label>Paste or Drop Decklist w/ Set IDs</Form.Label>
                  <Form.Control
                    as="textarea"
                    className={
                      dropError
                        ? 'border-danger border-5'
                        : dragging
                          ? 'border-success border-5'
                          : 'border-primary border-5'
                    }
                    isInvalid={Boolean(errors.deck)}
                    name="deck"
                    onChange={handleChange}
                    onDragExit={handleDragExit}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    placeholder="// comments are ignored
4 Angel's Trumpet (ulg)
2 Arc Spitter (snc)"
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
          {loading ? (
            <Row>
              <Col className="text-center" xs={12}>
                <FontAwesomeIcon icon={faSpinner} size="3x" spin />
              </Col>
            </Row>
          ) : hands.length ? (
            <Fragment>
              <DrawStats hands={hands} />
              <MagicHand hand={hands[hands.length - 1]} />
            </Fragment>
          ) : null}
        </Container>
      </Card>
    </Fragment>
  );
}
