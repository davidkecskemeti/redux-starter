import { createSlice} from "@reduxjs/toolkit";
import {createSelector} from "@reduxjs/toolkit";
import {apiCallBegan} from "./api";
import moment from "moment";
import {url} from "../config/endpoints";

//Reducer
const slice = createSlice({
    name: 'bugs',
    initialState: {
        list: [],
        loading: false,
        lastFetch: null
    },
    reducers: {

        bugsRequestFailed: (bugs, action) => {
            bugs.loading = false
        },

        bugsRequested: (bugs, action) => {
            bugs.loading = true
        },

        bugsReceived: (bugs, action) => {
            bugs.list = action.payload;
            bugs.loading = false
            bugs.lastFetch = Date.now();
        },

        bugAssignedToUser: (bugs, action) => {
            const {id: bugId, userId} = action.payload;
            const index = bugs.list.findIndex(bug => bug.id === bugId)
            bugs.list[index].userId = userId;
        },

        //command - event
        // addBug - bugAdded
        bugAdded: (bugs, action) => {
            bugs.list.push(action.payload)
        },

        //resolveBug(command) - bugResolved (event)
        bugResolved: (bugs, action) => {
            const index = bugs.list.findIndex(bug => bug.id === action.payload.id)
            bugs.list[index].resolved = true
        }
    }
})

const {
    bugAdded,
    bugResolved,
    bugAssignedToUser,
    bugsReceived,
    bugsRequested,
    bugsRequestFailed
} = slice.actions;


//Action creators
export const loadBugs = () => (dispatch, getState) => {
    const {lastFetch} = getState().entities.bugs;

    const diffInMinutes = moment().diff(moment(lastFetch), 'minutes')

    if (diffInMinutes < 10) return

   return  dispatch(
        apiCallBegan({
            url,
            onStart: bugsRequested.type,
            onSuccess: bugsReceived.type,
            onError: bugsRequestFailed.type
        })
    )
}

export const addBug = bug => apiCallBegan({
    url,
    method: "post",
    data: bug,
    onSuccess: bugAdded.type
})

export const resolveBug = id => apiCallBegan({
    // /bugs
    // PUT we update the entire resource
    // PATH we update one or more properties
    //We only update the resolve property so thats why patch
    //PATCH /bugs/1
    url: url + '/' + id,
    method: 'patch',
    data: {resolved: true},
    onSuccess: bugResolved.type
})


export const assignButToUser = (bugId, userId) => apiCallBegan({
    url: url + '/' + bugId,
    method: 'patch',
    data: {userId},
    onSuccess: bugAssignedToUser.type
})

//Selector
//Memozation
export const getUnresolvedBugs = createSelector(
    state => state.entities.bugs,
    state=>state.entities.projects,
    bugs => bugs.list.filter(bug => !bug.resolved)
)

export const getBugsByUser = userId => createSelector(
    state => state.entities.bugs,
    bugs => bugs.list.filter(bug => bug.userId === userId)
)

export default slice.reducer;

