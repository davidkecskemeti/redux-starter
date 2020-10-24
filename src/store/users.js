import {createAction, createReducer, createSlice} from "@reduxjs/toolkit";

//Reducer
let lastId = 0;

const slice = createSlice({
    name: "users",
    initialState: [],
    reducers: {

        //Action => action handler
        userAdded: (users, action) => {
            users.push({
                id: ++lastId,
                name: action.payload.name,
            });
        }
    }
})

export const {userAdded} = slice.actions

export default slice.reducer;