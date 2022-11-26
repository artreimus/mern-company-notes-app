import { Link } from 'react-router-dom';

const Welcome = () => {
  const date = new Date();
  const today = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(date);
  console.log(date);

  const content = (
    <section className="welcome">
      <p>{today}</p>
      <h1>Welcome!</h1>
      <p>
        <Link to="/dash/notes">View notes</Link>
      </p>
      <p>
        <Link to="/dash/notes/new">Add new note</Link>
      </p>
      <p>
        <Link to="/dash/users">View User Settings</Link>
      </p>
      <p>
        <Link to="/dash/users/new">Add new user</Link>
      </p>
    </section>
  );

  return content;
};

export default Welcome;
