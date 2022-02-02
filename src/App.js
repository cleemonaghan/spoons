import React, { useState, useEffect } from "react";
//import logo from "./logo.svg";
import "./App.css";
import { API, Auth, Storage } from "aws-amplify";
import { withAuthenticator, Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

//import { DataStore } from "@aws-amplify/datastore";
//import { Post, Comment, Chat } from "./models";

import { listPosts } from "./graphql/queries";
//import * as mutations from './graphql/mutations';
import {
	createPost as createPostMutation,
	deletePost as deletePostMutation,
} from "./graphql/mutations";

const initialFormState = {
	title: "",
	user: "",
	description: "",
	//Comments: [],
	image: null,
};

function NotesPage(signOut) {
	const [user, setUser] = useState({ username: "" });
	//local varaiable holding all the posts we need to display
	const [notes, setNotes] = useState([]);
	//variable holding all the data entered in theform fields
	const [formData, setFormData] = useState(initialFormState);

	//fetch the posts at the beginning
	useEffect(() => {
		getUser();
		fetchPosts();
	}, []);

	async function getUser() {
		//let res = await Auth.currentAuthenticatedUser();
		//console.log(res);
		let user = (await Auth.currentAuthenticatedUser()).username;
		setUser({ username: user });
	}

	async function fetchPosts() {
		//fetch all the Posts
		const apiData = await API.graphql({
			query: listPosts,
			variables: { _deleted: false },
		});
		//Update each Post with the associated image
		const postsFromAPI = apiData.data.listPosts.items;
		await Promise.all(
			postsFromAPI.map(async (post) => {
				if (post.image) {
					const image = await Storage.get(post.image);
					post.image = image;
				}
				return post;
			})
		);
		//filter out the deleted items
		let items = apiData.data.listPosts.items.filter(
			(item) => !item["_deleted"]
		);
		//Update the local variable (notes) for the fetched Posts
		setNotes(items);
	}

	/**
	 * This function
	 * @param {*} e
	 * @returns
	 */
	async function onChange(e) {
		if (!e.target.files[0]) return;
		const file = e.target.files[0];
		setFormData({ ...formData, image: file.name });
		await Storage.put(file.name, file);
		fetchPosts();
	}

	async function createNote() {
		//if the User did not enter a title, don't create a post
		if (!formData.title) return;
		//get the User's username and add it to the form data
		formData.user = user.username;
		//create a new Post using the form data
		await API.graphql({
			query: createPostMutation,
			variables: { input: formData },
		});
		//if they added an image, add the image to the storage
		if (formData.image) {
			const image = await Storage.get(formData.image);
			formData.image = image;
		}
		//update the local varaible for the posts
		setNotes([...notes, formData]);
		//reset the form
		setFormData(initialFormState);
	}

	async function deleteNote(post) {
		//remove the post from the local variable (notes)
		const newNotesArray = notes.filter((note) => note.id !== post.id);
		setNotes(newNotesArray);
		//create a json variable with the id and version of the Post
		const postDetails = {
			id: post.id,
			_version: post._version,
		};
		//remove the post from the backend
		await API.graphql({
			//query: mutations.deleteTodo,
			query: deletePostMutation,
			variables: { input: postDetails },
		});
	}

	function MakePost(props) {
		const data = props.data;
		//if it is not this User's post, don't allow them to delete it
		if (user.username === data.user) {
			return (
				<div>
					<h2>
						{data.title} by {data.user}
					</h2>
					<p>{data.description}</p>

					<button onClick={() => deleteNote(data)}>Delete note</button>
					{data.image && (
						<img src={data.image} alt="post_image" style={{ width: 400 }} />
					)}

					<p>{new Date(data.createdAt).toString()}</p>
				</div>
			);
		} else {
			//console.log("B");
			return (
				<div>
					<h2>
						{data.title} by {data.user}
					</h2>
					<p>{data.description}</p>
					{data.image && (
						<img src={data.image} alt="post_image" style={{ width: 400 }} />
					)}

					<p>{new Date(data.createdAt).toString()}</p>
				</div>
			);
		}
	}

	return (
		<div className="App">
			<h1>My Notes App</h1>
			<p>Hey {user.username}, welcome to Quizzards!</p>
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
			<input type="file" onChange={onChange} />
			<button onClick={createNote}>Create Note</button>

			<button
				onClick={() => {
					fetchPosts();
					console.log(notes);
				}}
			>
				log
			</button>
			<div style={{ marginBottom: 30 }}>
				{notes.map((post) => (
					<div
						key={post.id || post.name}
						style={{
							backgroundColor: "lightBlue",
							width: 600,
							marginLeft: "auto",
							marginRight: "auto",
						}}
					>
						<MakePost data={post} />
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
