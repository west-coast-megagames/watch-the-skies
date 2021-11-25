import React, { useEffect } from "react";
import { FlexboxGrid, Popover, Whisper, Tag, Badge, TagGroup, Alert, IconButton, Icon, Panel, Container, Progress} from 'rsuite';
const FacilityStats = (props) => {
	const [showTransfer, setShowTransfer] = React.useState(false);

		let { stats, status, name, zone, type, origin, site, team, mission, upgrades, actions, missions } = props.facility;
		return (
			<Container>
	
				SCOTT WILL MAKE THIS LATER 
			</Container>
			
	
		);
	

}


const healthSpeaker = (
  <Popover title="Health Information">
    <p>
      Health is the amount of damage your military unit can absorge before being
      destroyed, if it goes to 0 your unit will cease to exist!
    </p>
  </Popover>
);

const attackSpeaker = (
  <Popover title="Attack Rating Information">
    <p>Attack is the power rating for the unit when it attacks.</p>
  </Popover>
);

const evadeSpeaker = (
  <Popover title="Evasion Rating Information">
    <p>
      How likely this aircraft can be spotted, opposed by detection
    </p>
  </Popover>
);

const detectionSpeaker = (
  <Popover title="Evasion Rating Information">
    <p>
      How likely this aircraft can spot hostile asircraft, opposed by evade
    </p>
  </Popover>
);

const armorSpeaker = (
  <Popover title="Armor">
    <p>
      Armor does... something?
    </p>
  </Popover>
);

const penetrationSpeaker = (
  <Popover title="Penetration Info">
    <p>
      Penetration does... something
    </p>
  </Popover>
);

const invadeSpeaker = (
  <Popover title="Invasion Cost Information">
    <p>
      Invasion costs is the price you will pay use this unit to attack an
      adjacent site.
    </p>
  </Popover>
);

export default FacilityStats;