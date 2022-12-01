import { useParams } from 'react-router-dom';
import EditNoteForm from './EditNoteForm';
import { useGetNotesQuery } from './notesApiSlice';
import { useGetUsersQuery } from '../users/usersApiSlice';
import useAuth from '../../hooks/useAuth';
import PulseLoader from 'react-spinners/PulseLoader';
import useTitle from '../../hooks/useTitle';

const EditNote = () => {
  useTitle('Copi');
  const { id } = useParams();
  const { username, isManager, isAdmin } = useAuth();

  const { isLoading, note } = useGetNotesQuery('notesList', {
    selectFromResult: ({ data, isLoading, isError }) => ({
      isLoading,
      isError,
      note: data?.entities[id],
    }),
  });

  const { users } = useGetUsersQuery('usersList', {
    selectFromResult: ({ data }) => ({
      users: data?.ids.map((id) => data?.entities[id]),
    }),
  });

  if (isLoading) return <PulseLoader color={'#FFF'} />;

  if (!note) {
    return <p className="errmsg">Invalid note id</p>;
  }

  if (!isManager && !isAdmin) {
    if (note.username !== username) {
      return <p className="errmsg">No access</p>;
    }
  }

  const content = <EditNoteForm note={note} users={users} />;

  return content;
};

export default EditNote;
