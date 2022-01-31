import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { API, Auth } from "aws-amplify";
import { withAuthenticator, Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

import { DataStore } from "@aws-amplify/datastore";
import { Post, Comment, Chat } from "./models";

/*import { listPosts } from "./graphql/queries";
import {
	createPost as createPostMutation,
	deletePost as deletePostMutation,
} from "./graphql/mutations";
*/

const initialFormState = {
	title: "",
	user: "",
	description: "",
	Comments: [],
};

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

function NotesPage(signOut) {
	const [notes, setNotes] = useState([]);
	const [formData, setFormData] = useState(initialFormState);

	useEffect(() => {
		fetchNotes();
	}, []);

	async function fetchNotes() {
		//const apiData = await API.graphql({ query: listPosts });
		const models = await DataStore.query(Post);
		setNotes(models);
	}

	async function createNote() {
		/*
			id: ID!
  			title: String!
  			user: String!
  			description: String
		*/
		if (!formData.title) return;
		formData.user = (await Auth.currentAuthenticatedUser()).username;
		console.log(formData.user);
		await DataStore.save(new Post(formData));
		setNotes([...notes, formData]);
		setFormData(initialFormState);
		console.log(notes);
	}

	async function deleteNote({ id }) {
		console.log(id);
		const newPostsArray = notes.filter((note) => note.id !== id);
		setNotes(newPostsArray);
		console.log(newPostsArray);
		const modelToDelete = await DataStore.query(Post, id);
		console.log(modelToDelete);
		await DataStore.delete(modelToDelete);
	}

	return (
		<div className="App">
			<h1>My Notes App</h1>
			<p>Hey {/*Auth.currentAuthenticatedUser()*/}, welcome to Quizzards!</p>
			<button onClick={signOut}>Sign out</button>
			<input
				onChange={(e) => setFormData({ ...formData, title: e.target.value })}
				placeholder="Post title"
				value={formData.title}
			/>
			<input
				onChange={(e) =>
					setFormData({ ...formData, description: e.target.value })
				}
				placeholder="Note description"
				value={formData.description}
			/>
			<button onClick={createNote}>Create Note</button>

			<button
				onClick={() => {
					fetchNotes();
					console.log(notes);
				}}
			>
				log
			</button>
			<div style={{ marginBottom: 30 }}>
				{notes.map((note) => (
					<div key={note.id || note.name}>
						<h2>
							{note.title} by {note.user}
						</h2>
						<p>{note.description}</p>
						<button onClick={() => deleteNote(note)}>Delete note</button>
					</div>
				))}
			</div>
		</div>
	);
}

function App() {
	return (
		<Authenticator>{({ signOut, user }) => NotesPage(signOut)}</Authenticator>
	);
}

export default withAuthenticator(App);
