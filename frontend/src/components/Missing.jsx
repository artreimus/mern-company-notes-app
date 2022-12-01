import { Link } from 'react-router-dom';

const Missing = () => {
  return (
    <div className="center__all change">
      <h1>Oops!</h1>
      <p>Page not Found</p>
      <div>
        <Link to="/">Go back home</Link>
      </div>
    </div>
  );
};

export default Missing;
