import { Fragment } from 'react';
import { Card } from 'react-bootstrap';

import { getPageTitle } from '../utils';

export function Component() {
  return (
    <Fragment>
      <title>{getPageTitle('Home')}</title>
      <Card body>
        <Card.Title>Home</Card.Title>
      </Card>
    </Fragment>
  );
}
