import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { withAuthenticator, Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

function loadScreen(signOut, user) {
	return (
		<div className="App">
			<header className="App-header">
				<img src={logo} className="App-logo" alt="logo" />
				<p>Hey {user.username}, welcome to Quizzards!</p>
				<button onClick={signOut}>Sign out</button>
			</header>
		</div>
	);
}

function App() {
	return (
		<Authenticator>
			{({ signOut, user }) => loadScreen(signOut, user)}
		</Authenticator>
	);
}

export default withAuthenticator(App);
