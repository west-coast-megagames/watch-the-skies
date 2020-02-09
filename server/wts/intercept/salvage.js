function generateSalvage (system, status) {
    system.status.salvage = true;
    if (status === 'Damaged') {
        system.status.damaged = true;
    } else if (status === 'Deastroyed') {
        system.status.destroyed = true;
    }
    
    return  
}