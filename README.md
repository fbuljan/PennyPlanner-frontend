# PennyPlanner Frontend

Frontend application made for the project which is a part of my bachelor's thesis at FER. Written as a Vue3 application.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Building for Production](#building-for-production)

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine
- A code editor (Visual Studio Code recommended)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/fbuljan/PennyPlanner-frontend.git
    cd PennyPlanner-frontend
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

## Configuration

1. Copy the `.env.config` file to `.env`:

    ```bash
    cp .env.config .env
    ```

2. Adjust the configuration in `.env` as necessary for your environment.

## Running the Application

1. Compiles and hot-reloads for development:

    ```bash
    npm run serve
    ```

    The application should now be running at `http://localhost:8080`.

## Building for Production

1. Compiles and minifies for production:

    ```bash
    npm run build
    ```
