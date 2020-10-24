import {createAction, createReducer} from "@reduxjs/toolkit";

//Action creators
export const projectAdd = createAction("projectAdd");

//Reducer
let lastId = 0;

export default  createReducer([], {

    [projectAdd.type]: (projects, action) => {
        projects.push({
            id: ++lastId,
            name: action.payload.name,
        })
    },

})