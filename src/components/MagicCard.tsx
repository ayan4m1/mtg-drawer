import { Col, OverlayTrigger } from 'react-bootstrap';

interface IProps {
  image: string;
  name: string;
}

export default function MagicCard({ image, name }: IProps) {
  return (
    <OverlayTrigger
      overlay={(props) => (
        <div {...props}>
          <img alt={name} src={image} style={{ height: '500px' }} />
        </div>
      )}
      placement="auto"
    >
      <Col className="my-3" style={{ textAlign: 'center' }} xs={3}>
        <img alt={name} src={image} style={{ height: '260px' }} />
      </Col>
    </OverlayTrigger>
  );
}
