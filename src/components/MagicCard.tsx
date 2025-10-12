import { Col } from 'react-bootstrap';

interface IProps {
  image: string;
  name: string;
}

export default function MagicCard({ image, name }: IProps) {
  return (
    <Col className="my-3" style={{ textAlign: 'center' }} xs={3}>
      <img alt={name} src={image} style={{ height: '260px' }} />
    </Col>
  );
}
