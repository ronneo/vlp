import React from 'react';
import './Main.css';
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import LaunchPad from './components/LaunchPad'

function Main() {
	return (
		<div className="bp3-dark">
			<div className="Main-div">
				<LaunchPad />
			</div>
		</div>
	);
}

export default Main;
