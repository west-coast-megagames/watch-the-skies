// Notification Script tied to the alert.jsx common component
import store from '../store/store';
import { getId } from './counter'
import { notificationAdded, notificationHidden } from '../store/entities/notifications';

const notify = (alert) => {
    alert.id = getId();
    store.dispatch(notificationAdded({...alert, hidden: false }));
    setTimeout(() => store.dispatch(notificationHidden(alert.id)), 3000);
  };

  export default notify;