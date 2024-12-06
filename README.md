# alx-files_manager
This project is a summary of this back-end trimester: authentication, NodeJS, MongoDB, Redis, pagination and background processing.

---

# Files Manager API

This project is a simple file management system built using Node.js, Express, MongoDB, Redis, and Bull for background job processing. It allows users to create accounts, upload files, manage file visibility, and access file content. The project also includes background tasks for generating image thumbnails and sending welcome emails to new users.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Background Tasks](#background-tasks)
- [Tests](#tests)
- [Contributing](#contributing)
- [License](#license)

## Prerequisites

- Node.js (>= 14.17.0)
- MongoDB
- Redis
- npm or yarn

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/alx-files_manager.git
   cd alx-files_manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following content:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=27017
   DB_DATABASE=files_manager
   FOLDER_PATH=/tmp/files_manager
   ```

4. Start the server:
   ```bash
   npm run start-server
   ```

5. Start the worker:
   ```bash
   npm run start-worker
   ```

## Usage

### API Endpoints

#### Redis and MongoDB Status

- **GET /status**
  - **Description**: Check the status of Redis and MongoDB.
  - **Response**:
    ```json
    {
      "redis": true,
      "db": true
    }
    ```

- **GET /stats**
  - **Description**: Get the number of users and files in the database.
  - **Response**:
    ```json
    {
      "users": 12,
      "files": 1231
    }
    ```

#### User Management

- **POST /users**
  - **Description**: Create a new user.
  - **Request Body**:
    ```json
    {
      "email": "user@example.com",
      "password": "password123"
    }
    ```
  - **Response**:
    ```json
    {
      "id": "5f1e7d35c7ba06511e683b21",
      "email": "user@example.com"
    }
    ```

- **GET /connect**
  - **Description**: Sign in the user and generate an authentication token.
  - **Headers**:
    ```http
    Authorization: Basic base64(email:password)
    ```
  - **Response**:
    ```json
    {
      "token": "031bffac-3edc-4e51-aaae-1c121317da8a"
    }
    ```

- **GET /disconnect**
  - **Description**: Sign out the user.
  - **Headers**:
    ```http
    X-Token: token
    ```
  - **Response**:
    ```json
    {}
    ```

- **GET /users/me**
  - **Description**: Get the current user's information.
  - **Headers**:
    ```http
    X-Token: token
    ```
  - **Response**:
    ```json
    {
      "id": "5f1e7cda04a394508232559d",
      "email": "user@example.com"
    }
    ```

#### File Management

- **POST /files**
  - **Description**: Upload a new file.
  - **Headers**:
    ```http
    X-Token: token
    ```
  - **Request Body**:
    ```json
    {
      "name": "file.txt",
      "type": "file",
      "data": "SGVsbG8gV2Vic3RhY2shCg==",
      "parentId": "5f1e881cc7ba06511e683b23",
      "isPublic": false
    }
    ```
  - **Response**:
    ```json
    {
      "id": "5f1e879ec7ba06511e683b22",
      "userId": "5f1e7cda04a394508232559d",
      "name": "file.txt",
      "type": "file",
      "isPublic": false,
      "parentId": "5f1e881cc7ba06511e683b23",
      "localPath": "/tmp/files_manager/2a1f4fc3-687b-491a-a3d2-5808a02942c9"
    }
    ```

- **GET /files/:id**
  - **Description**: Get a file by ID.
  - **Headers**:
    ```http
    X-Token: token
    ```
  - **Response**:
    ```json
    {
      "id": "5f1e879ec7ba06511e683b22",
      "userId": "5f1e7cda04a394508232559d",
      "name": "file.txt",
      "type": "file",
      "isPublic": false,
      "parentId": "5f1e881cc7ba06511e683b23",
      "localPath": "/tmp/files_manager/2a1f4fc3-687b-491a-a3d2-5808a02942c9"
    }
    ```

- **GET /files**
  - **Description**: Get a list of files for a specific parent ID with pagination.
  - **Headers**:
    ```http
    X-Token: token
    ```
  - **Query Parameters**:
    - `parentId` (optional, default: 0)
    - `page` (optional, default: 0)
  - **Response**:
    ```json
    [
      {
        "id": "5f1e879ec7ba06511e683b22",
        "userId": "5f1e7cda04a394508232559d",
        "name": "file.txt",
        "type": "file",
        "isPublic": false,
        "parentId": "5f1e881cc7ba06511e683b23",
        "localPath": "/tmp/files_manager/2a1f4fc3-687b-491a-a3d2-5808a02942c9"
      }
    ]
    ```

- **PUT /files/:id/publish**
  - **Description**: Set a file to public.
  - **Headers**:
    ```http
    X-Token: token
    ```
  - **Response**:
    ```json
    {
      "id": "5f1e879ec7ba06511e683b22",
      "userId": "5f1e7cda04a394508232559d",
      "name": "file.txt",
      "type": "file",
      "isPublic": true,
      "parentId": "5f1e881cc7ba06511e683b23",
      "localPath": "/tmp/files_manager/2a1f4fc3-687b-491a-a3d2-5808a02942c9"
    }
    ```

- **PUT /files/:id/unpublish**
  - **Description**: Set a file to private.
  - **Headers**:
    ```http
    X-Token: token
    ```
  - **Response**:
    ```json
    {
      "id": "5f1e879ec7ba06511e683b22",
      "userId": "5f1e7cda04a394508232559d",
      "name": "file.txt",
      "type": "file",
      "isPublic": false,
      "parentId": "5f1e881cc7ba06511e683b23",
      "localPath": "/tmp/files_manager/2a1f4fc3-687b-491a-a3d2-5808a02942c9"
    }
    ```

- **GET /files/:id/data**
  - **Description**: Get the content of a file.
  - **Headers**:
    ```http
    X-Token: token (optional if the file is public)
    ```
  - **Query Parameters**:
    - `size` (optional, for images: 500, 250, 100)
  - **Response**:
    - File content with the appropriate MIME type.

## Background Tasks

- **File Queue**: Generates thumbnails for uploaded images.
- **User Queue**: Sends a welcome email to new users.

## Tests

To run the tests, use the following command:
```bash
npm test
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
