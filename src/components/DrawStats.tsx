import { useMemo } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { CardTypes, DataPoint, DeckEntry, ManaColors } from '../types';
import { manaHexColors, typeHexColors, typeMatches } from '../utils';

interface IProps {
  hands: DeckEntry[][];
}

const RADIAN = Math.PI / 180;

const renderInteriorLabel = ({
  cx,
  cy,
  name,
  midAngle,
  innerRadius,
  outerRadius,
  percent
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = cy + radius * Math.sin(-(midAngle ?? 0) * RADIAN);

  return (percent ?? 0) > 0 ? (
    <text
      dominantBaseline="central"
      fill={name === 'White' || name === 'Enchantment' ? 'black' : 'white'}
      textAnchor={x > cx ? 'start' : 'end'}
      x={x}
      y={y}
    >
      {`${((percent ?? 1) * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export default function DrawStats({ hands }: IProps) {
  const colorPieData = useMemo<DataPoint[]>(() => {
    const result: DataPoint[] = [];
    const colorCount = new Map<ManaColors, number>();

    for (const hand of hands) {
      for (const card of hand) {
        for (const [value, key] of Object.entries(ManaColors)) {
          if (!card.color.includes(ManaColors[value])) {
            continue;
          }

          if (!colorCount.has(key)) {
            colorCount.set(key, 0);
          }

          colorCount.set(key, colorCount.get(key) + 1);
        }
      }
    }

    for (const [value, key] of Object.entries(ManaColors)) {
      result.push({
        name: value,
        value: colorCount.get(key) ?? 0
      });
    }

    return result;
  }, [hands]);
  const typePieData = useMemo<DataPoint[]>(() => {
    const result: DataPoint[] = [];
    const typeCount = new Map<CardTypes, number>();

    for (const hand of hands) {
      for (const card of hand) {
        for (const [value, key] of Object.entries(CardTypes)) {
          if (
            !card.type ||
            !typeMatches[value].some((typeString) =>
              card.type.includes(typeString)
            )
          ) {
            continue;
          }

          if (!typeCount.has(key)) {
            typeCount.set(key, 0);
          }

          typeCount.set(key, typeCount.get(key) + 1);
        }
      }
    }

    for (const [value, key] of Object.entries(CardTypes)) {
      result.push({
        name: value,
        value: typeCount.get(key) ?? 0
      });
    }

    return result;
  }, [hands]);

  return hands.length ? (
    <Row className="my-2">
      <Col style={{ minHeight: 300 }} xs={12}>
        <h4>{hands.length} Total Draws</h4>
        <Container fluid>
          <Row className="g-0">
            <Col className="text-center me-1 offset-sm-1" sm={5} xs={12}>
              <h5>By Color</h5>
              <ResponsiveContainer height={250} width="100%">
                <PieChart height={250}>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={colorPieData}
                    dataKey="value"
                    fill="#8884d8"
                    isAnimationActive={false}
                    label={renderInteriorLabel}
                    labelLine={false}
                    nameKey="name"
                    outerRadius={100}
                  >
                    {colorPieData.map((entry) => (
                      <Cell
                        fill={manaHexColors[entry.name]}
                        key={`cell-${entry.name}`}
                        name={entry.name}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Col>
            <Col className="text-center ms-1" sm={5} xs={12}>
              <h5>By Type</h5>
              <ResponsiveContainer height={250} width="100%">
                <PieChart height={250}>
                  <Pie
                    cx="50%"
                    cy="50%"
                    data={typePieData}
                    dataKey="value"
                    fill="#8884d8"
                    isAnimationActive={false}
                    label={renderInteriorLabel}
                    labelLine={false}
                    outerRadius={100}
                  >
                    {typePieData.map((entry) => (
                      <Cell
                        fill={typeHexColors[entry.name]}
                        key={`cell-${entry.name}`}
                        name={entry.name}
                      />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Col>
          </Row>
        </Container>
      </Col>
    </Row>
  ) : null;
}
