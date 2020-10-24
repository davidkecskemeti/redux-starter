import React from 'react';
import './index.css';
import configureStore from './store/configureStore';
import {loadBugs, addBug, resolveBug, assignButToUser} from "./store/bugs";

const store = configureStore();

//UI layer
store.dispatch(addBug({description: "a"}))
store.dispatch(loadBugs())

setTimeout(() => store.dispatch(resolveBug(1)), 2000)

setTimeout(() => store.dispatch(assignButToUser(1, 4)), 4000)