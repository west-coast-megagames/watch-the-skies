import store from '../store/store';
import notify from './notify';
import { updateEvents } from '../api';
import { accountsUpdated } from '../store/entities/accounts';
import { aircraftsUpdated } from '../store/entities/aircrafts';
import { articleAdded } from '../store/entities/articles';
import { researchReceived } from '../store/entities/research';
import { usersRecieved, loginSocket } from '../store/entities/auth';
import { facilitiesUpdated } from '../store/entities/facilities';
import { militaryUpdated } from '../store/entities/military';
import { sitesReceived } from '../store/entities/sites';
import { upgradesUpdated } from '../store/entities/upgrades';
import { reportsUpdated } from '../store/entities/reports';

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

		updateEvents.updateUpgrades((err, upgrades) => {
			let state = store.getState()
			notify({catagory: 'update', type: 'success', title: 'Upgrades Update', body: `The upgrades for ${state.auth.team.name} have been updated...`});
			store.dispatch(upgradesUpdated(upgrades));
	});
		
		updateEvents.updateSites((err, sites) => {
			let state = store.getState()
			notify({catagory: 'update', type: 'success', title: 'Sitess Update', body: `The sites for ${state.auth.team.name} have been updated...`});
			store.dispatch(sitesReceived(sites));
	});

    updateEvents.updateAccounts((err, accounts) => {
        console.log(accounts)
        let state = store.getState()
        notify({catagory: 'update', type: 'success', title: 'Accounts Update', body: `The accounts for ${state.auth.team.name} have been updated...`});
        store.dispatch(accountsUpdated(accounts));
    });

    updateEvents.updateMilitary((err, military) => {
        console.log(military)
        notify({catagory: 'update', type: 'success', title: 'Military Update', body: `The current state of military has been updated...`});
				store.dispatch(militaryUpdated(military));
			});

    updateEvents.updateFacilities((err, facilities) => {
        console.log(facilities)
        notify({catagory: 'update', type: 'success', title: 'Facilities Update', body: `The current state facilities has been updated...`});
        store.dispatch(facilitiesUpdated(facilities));
    });

    updateEvents.updateReports((err, reports) => {
        notify({catagory: 'update', type: 'success', title: 'Reports Update', body: `The current state of game reports has been updated...`});
        store.dispatch(reportsUpdated(reports));
    });

    updateEvents.updateResearch((err, research) => {
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

    updateEvents.login((err, data) => {
        console.log(data)
        store.dispatch(loginSocket(data));
    });
}


export default initUpdates;