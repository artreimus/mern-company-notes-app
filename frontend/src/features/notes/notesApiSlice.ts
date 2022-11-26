import { createSelector, createEntityAdapter } from '@reduxjs/toolkit';
import { apiSlice } from '../../app/api/apiSlice';
import { RootState } from '../../app/store';

type INotes = {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  text: string;
  ticket: number;
  title: string;
  __v: number;
  completed: boolean;
  user: {
    __id: string;
    username: string;
  };
};

const notesAdapter = createEntityAdapter({
  sortComparer: (a: INotes, b: INotes) => {
    console.log(a);
    return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
  },
});

const initialState = notesAdapter.getInitialState();

export const notesApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotes: builder.query<INotes[], void>({
      query: () => '/notes',
      validateStatus: (response: any, result: any) => {
        return response.status === 200 && !result.isError;
      },
      transformResponse: (responseData: INotes[]) => {
        console.log(responseData);
        const loadednotes = responseData.map((note: any) => {
          note.id = note._id;
          return note;
        });
        return notesAdapter.setAll(initialState, loadednotes);
      },
      providesTags: (result, error, arg) => {
        // console.log(result);
        if (result?.ids) {
          // console.log('result: ', result);
          return [
            { type: 'note', id: 'LIST' },
            ...result.ids.map((id: string) => ({ type: 'note', id })),
          ];
        } else return [{ type: 'note', id: 'LIST' }];
      },
    }),
    addNewNote: builder.mutation({
      query: (initialNote) => ({
        url: '/notes',
        method: 'POST',
        body: {
          ...initialNote,
        },
      }),
      invalidatesTags: [{ type: 'Note', id: 'LIST' }],
    }),
    updateNote: builder.mutation({
      query: (initialNote) => ({
        url: '/notes',
        method: 'PATCH',
        body: {
          ...initialNote,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Note', id: arg.id }],
    }),
    deleteNote: builder.mutation({
      query: ({ id }) => ({
        url: `/notes`,
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Note', id: arg.id }],
    }),
  }),
});

export const {
  useGetNotesQuery,
  useAddNewNoteMutation,
  useUpdateNoteMutation,
  useDeleteNoteMutation,
} = notesApiSlice;

// returns the query result object
export const selectNotesResult = notesApiSlice.endpoints.getNotes.select();

// creates memoized selector
const selectNotesData = createSelector(
  selectNotesResult,
  (notesResult) => notesResult.data // normalized state object with ids & entities
);

//getSelectors creates these selectors and we rename them with aliases using destructuring
export const {
  selectAll: selectAllNotes,
  selectById: selectNoteById,
  selectIds: selectNoteIds,
  // Pass in a selector that returns the notes slice of state
} = notesAdapter.getSelectors<RootState>(
  (state) => selectNotesData(state) ?? initialState
);
