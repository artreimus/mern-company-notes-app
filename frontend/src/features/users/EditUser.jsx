import { useParams } from 'react-router-dom';
import EditUserForm from './EditUserForm';
import { useGetUsersQuery } from './usersApiSlice';
import PulseLoader from 'react-spinners/PulseLoader';
import useTitle from '../../hooks/useTitle';

const EditUser = () => {
  useTitle('Copi');
  const { id } = useParams();
  const { user, isLoading } = useGetUsersQuery('usersList', {
    selectFromResult: ({ data, isLoading }) => ({
      user: data?.entities[id],
      isLoading,
    }),
  });

  if (isLoading) return <PulseLoader color={'#FFF'} />;

  if (!user) {
    return <p className="errmsg">Invalid user id</p>;
  }

  const content = <EditUserForm user={user} />;

  return content;
};

export default EditUser;
