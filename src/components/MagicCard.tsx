import { Col, OverlayTrigger } from 'react-bootstrap';
import { OverlayInjectedProps } from 'react-bootstrap/Overlay';

import genericCardBack from '../images/card-back.png';

interface IProps {
  image?: string;
  name: string;
}

export default function MagicCard({ image, name }: IProps) {
  return (
    <OverlayTrigger
      overlay={(props: OverlayInjectedProps) =>
        image ? (
          <div {...props}>
            <img alt={name} src={image} style={{ height: '500px' }} />
          </div>
        ) : (
          <div
            {...props}
            style={{
              ...props.style,
              backgroundColor: '#262323',
              borderRadius: 8,
              padding: 20
            }}
          >
            {name}
          </div>
        )
      }
      placement="auto"
    >
      <Col className="my-3" style={{ textAlign: 'center' }} xs={3}>
        <img
          alt={name}
          src={image ? image : genericCardBack}
          style={{ height: '260px' }}
        />
      </Col>
    </OverlayTrigger>
  );
}
