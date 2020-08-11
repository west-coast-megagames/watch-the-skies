import store from '../store/store';
import notify from './notify';
import { updateEvents } from '../api';
import { accountsUpdated } from '../store/entities/accounts';
import { aircraftsUpdated } from '../store/entities/aircrafts';
import { articleAdded } from '../store/entities/articles';
import { logsUpdated } from '../store/entities/logs';
import { researchReceived } from '../store/entities/research';
import { usersRecieved } from '../store/entities/auth';

const initUpdates = () => {
    updateEvents.updateTeam((err, team) => {
        console.log(team)
        let state = store.getState()
        if (state.auth.team.name !== "Select Team") {
        notify({catagory: 'update', type: 'success', title: 'Accounts Update', body: `The accounts for ${state.auth.team.name} have been updated...`})
        }
    });

    updateEvents.updateAircrafts((err, aircrafts) => {
        let state = store.getState()
        notify({catagory: 'update', type: 'success', title: 'Aircrafts Update', body: `The aircrafts for ${state.auth.team.name} have been updated...`});
        store.dispatch(aircraftsUpdated(aircrafts));
    });

    updateEvents.updateAccounts((err, accounts) => {
        console.log(accounts)
        let state = store.getState()
        notify({catagory: 'update', type: 'success', title: 'Accounts Update', body: `The accounts for ${state.auth.team.name} have been updated...`});
        store.dispatch(accountsUpdated(accounts));
    });

    updateEvents.updateMilitary((err, military) => {
        console.log(military)
        let state = store.getState()
        notify({catagory: 'update', type: 'success', title: 'Military Update', body: `The current state of military has been updated...`});
    });

    updateEvents.updateFacilities((err, facilities) => {
        console.log(facilities)
        let state = store.getState()
        notify({catagory: 'update', type: 'success', title: 'Facilities Update', body: `The current state facilities has been updated...`});
    });

    updateEvents.updateLogs((err, logs) => {
        let state = store.getState()
        notify({catagory: 'update', type: 'success', title: 'Logs Update', body: `The current state of game logs has been updated...`});
        store.dispatch(logsUpdated(logs));
    });

    updateEvents.updateResearch((err, research) => {
        let state = store.getState()
        notify({catagory: 'update', type: 'success', title: 'Research Update', body: `The current state of game research has been updated...`});
        store.dispatch(researchReceived(research));
    });

    updateEvents.addNews((err, article) => {
        console.log(article)
        notify({catagory: 'update', type: 'success', title: `News Published`, body: `${article.publisher.name} published ${article.headline}`});
        store.dispatch(articleAdded(article))
    });

    updateEvents.updateUsers((err, users) => {
        console.log(users)
        store.dispatch(usersRecieved(users))
    });
}


export default initUpdates;