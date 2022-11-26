import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import DashLayout from './components/DashLayout';
import Layout from './components/Layout';
import Login from './features/Auth/Login';
import Public from './components/Public';
import Welcome from './features/Auth/Welcome';
import UsersList from './features/users/UsersList';
import NotesList from './features/notes/NotesList';
import EditNote from './features/notes/EditNote';
import EditUser from './features/users/EditUser';
import NewNote from './features/notes/NewNote';
import NewUserForm from './features/users/NewUserForm';
import Prefetch from './features/Auth/Prefetch';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Public />} />
        <Route path="login" element={<Login />} />

        <Route element={<Prefetch />}>
          <Route path="dash" element={<DashLayout />}>
            <Route index element={<Welcome />} />

            <Route path="users">
              <Route index element={<UsersList />} />
              <Route path=":id" element={<EditUser />} />
              <Route path="new" element={<NewUserForm />} />
            </Route>
            <Route path="notes">
              <Route index element={<NotesList />} />
              <Route path=":id" element={<EditNote />} />
              <Route path="new" element={<NewNote />} />
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
