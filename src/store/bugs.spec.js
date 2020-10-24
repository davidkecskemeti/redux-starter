import {addBug, getUnresolvedBugs, loadBugs, resolveBug} from "./bugs";
import configureStore from "./configureStore";
import MockAdapter from "axios-mock-adapter";
import axios from 'axios'

describe("bugSlice", () => {

    let fakeAxios;
    let store;

    beforeEach(() => {
        fakeAxios = new MockAdapter(axios);
        store = configureStore();
    })

    const bugsSlice = () => store.getState().entities.bugs;
    const createState = () => ({
        entities: {
            bugs: {
                list: []
            }
        }
    })

    /**
     * loading bugs
     *  if they exist in the change
     *      *they should come from the cache
     *  if they dont exist in the chache
     *  *they should be fetched fromt he servier
     *  -loading indicator
     *  *should be true while fatching
     *  *should be false after bugs are fetched
     *  *shouzld be false if the server fails
     */

    describe("loading bugs", () => {

        describe("if the bugs exist in the cache", () => {
            it('they should not be fetched from the server again', async () => {
                fakeAxios.onGet("/bugs").reply(200, [{id: 1}])

                await store.dispatch(loadBugs())
                await store.dispatch(loadBugs())

                expect(fakeAxios.history.get.length).toBe(1)
            });
        })

        describe("if the bugs dont exist int he cache", () => {

            it('they should be fetched from the server and put in the store', async () => {
                fakeAxios.onGet("/bugs").reply(200, [{id: 1}])

                await store.dispatch(loadBugs())
                await store.dispatch(loadBugs())

                expect(bugsSlice().list).toHaveLength(1)
            });

            describe("loading indicator", () => {
                it('should be true while fetching the bugs', () => {
                    fakeAxios.onGet("/bugs").reply(200, [{id: 1}])
                    fakeAxios.onGet("/bugs").reply(() => {
                        expect(bugsSlice().loading).toBe(true)
                        return [200, [{id: 1}]]
                    })

                    store.dispatch(loadBugs())
                });

                it('should be false after true are fetched', async () => {
                    fakeAxios.onGet("/bugs").reply(200, [{id: 1}])

                    await store.dispatch(loadBugs())

                    expect(bugsSlice().loading).toBe(false)
                });

                it('should be false if the server returns an error', async () => {
                    fakeAxios.onGet("/bugs").reply(500)

                    await store.dispatch(loadBugs())

                    expect(bugsSlice().loading).toBe(false)
                });

            })
        })
    })

    it("should mark the bug as resolved if it's saved to the server", async () => {
        //AAA
        fakeAxios.onPatch("/bugs/1").reply(200, {id: 1, resolved: true})
        fakeAxios.onPost("/bugs").reply(200, {id: 1})

        await store.dispatch(addBug({}))
        await store.dispatch(resolveBug(1))

        expect(bugsSlice().list[0].resolved).toBe(true)
    });

    it("should not mark the bug as resolved if it's not saved to the server", async () => {
        //AAA
        fakeAxios.onPatch("/bugs/1").reply(500,)
        fakeAxios.onPost("/bugs").reply(200, {id: 1})

        await store.dispatch(addBug({}))
        await store.dispatch(resolveBug(1))

        expect(bugsSlice().list[0].resolved).not.toBe(true)
    });


    it("should add the bug to the store if it's saved to the server", async () => {
        ///AAA pattern
        //Arrange
        const bug = {description: 'a'}
        const savedBug = {...bug, id: 1}

        fakeAxios.onPost('/bugs').reply(200, savedBug)

        //Act
        await store.dispatch(addBug(bug))

        //Assert
        console.log(store.getState().entities.bugs.list)
        expect(bugsSlice().list).toContainEqual(savedBug)

        //dispatch(addBug) => store
    })

    it("should not add the bug to the store if it's not saved to the server", async () => {
        ///AAA pattern
        //Arrange
        const bug = {description: 'a'}

        fakeAxios.onPost('/bugs').reply(500)

        //Act
        await store.dispatch(addBug(bug))

        //Assert
        expect(bugsSlice().list).toHaveLength(0)

        //dispatch(addBug) => store
    })

    describe("selectors", () => {
        it('getUnresolvedBugs', () => {
            const state = createState();
            state.entities.bugs.list = [{id: 1, resolved: true}, {id: 2}, {id: 3}]

            const result = getUnresolvedBugs(state)

            expect(result).toHaveLength(2)
        });
    })

})