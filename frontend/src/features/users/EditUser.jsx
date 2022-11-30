import { useParams } from 'react-router-dom';
import EditUserForm from './EditUserForm';
import { useGetUsersQuery } from './usersApiSlice';
import PulseLoader from 'react-spinners/PulseLoader';
import useTitle from '../../hooks/useTitle';

const EditUser = () => {
  useTitle('Copi');
  const { id } = useParams();
  const { user } = useGetUsersQuery('usersList', {
    selectFromResult: ({ data }) => ({ user: data?.entities[id] }),
  });

  const content = user ? (
    <EditUserForm user={user} />
  ) : (
    <PulseLoader color={'#FFF'} />
  );

  return content;
};

export default EditUser;
