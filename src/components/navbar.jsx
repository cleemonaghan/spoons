import React, { Component } from "react";
import { Navbar, Container, Nav } from "react-bootstrap";

class NavBar extends React.Component {
  render() {
    return (
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#">
            <img
              alt=""
              src=""
              height="30"
              className="d-inline-block align-top"
            />{" "}
            Quizzards
          </Navbar.Brand>
          <Nav className="me-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#groups">Groups</Nav.Link>
            <Nav.Link href="#messages">Messages</Nav.Link>
            <Nav.Link href="#profile">Profile</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
    );
  }
}

export default NavBar;
