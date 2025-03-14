# TechTrails

## [Live Link](https://techtrails-2015.web.app/)

## Overview

This is a blog site project built with Node.js and Express.js, utilizing MongoDB for data storage. The application allows users to create, read, update, and delete blog posts, as well as manage comments and user accounts.

## Features

- **User Authentication**:

  - JWT-based authentication for secure user login and registration.
  - Users can log out, which clears their authentication cookie.

- **Blog Management**:

  - Users can create new blog posts.
  - Retrieve all blogs or filter by recent or featured blogs.
  - View individual blog posts by ID.

- **Comment System**:

  - Users can add comments to blog posts.
  - Comments are stored in a structured format, allowing for easy retrieval.

- **Wishlist Functionality**:

  - Users can maintain a wishlist of blogs they are interested in.
  - Users can add or remove blogs from their wishlist.

- **CORS Support**:
  - Configured to allow requests from specified origins, enabling cross-origin resource sharing.

## Installed Packages

The following npm packages are used in this project:

- **express**: A web framework for Node.js, used to build the server and handle routing.
- **cors**: Middleware to enable CORS (Cross-Origin Resource Sharing).
- **jsonwebtoken**: A library to create and verify JSON Web Tokens for user authentication.
- **cookie-parser**: Middleware to parse cookies attached to the client request object.
- **mongodb**: The official MongoDB driver for Node.js, used to interact with the MongoDB database.
- **dotenv**: A zero-dependency module that loads environment variables from a `.env` file into `process.env`.

## Getting Started

### Prerequisites

- Node.js installed on your machine.
- MongoDB account and a cluster set up (e.g., MongoDB Atlas).

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/FardinMahadi/b10-a11-blog-post-server-side.git
   cd <repository-directory>
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your MongoDB connection string and JWT secret:

   ```plaintext
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   ACCESS_TOKEN_SECRET=your_jwt_secret
   PORT=5000
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. The server will run on `http://localhost:5000`.

## API Endpoints

- **POST /jwt**: Generate a JWT token for user authentication.
- **POST /logout**: Clear the authentication cookie.
- **GET /users**: Retrieve user information by email.
- **POST /users**: Register a new user.
- **GET /blogs**: Retrieve all blogs.
- **GET /recentblogs**: Retrieve the 6 most recent blogs.
- **GET /featuredblogs**: Retrieve blogs marked as featured.
- **GET /blog/:id**: Retrieve a specific blog by ID.
- **GET /wishlist**: Retrieve the user's wishlist of blogs.
- **POST /comment**: Add a comment to a blog post.
- **GET /comment**: Retrieve comments for a specific blog post.
- **PATCH /wishlist**: Update the user's wishlist.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Thanks to the contributors and the open-source community for their support and resources.
