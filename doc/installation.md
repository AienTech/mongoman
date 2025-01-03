---
layout: default
title: Installation
nav_order: 2
---

# Installation Guide

MongoMan can be installed and run either using Docker or by building from source.

## Docker Installation

### Using docker-compose

Create a `docker-compose.yml` file:

```yaml
version: '3'
services:
  mongoman:
    image: ghcr.io/aientech/mongoman:main
    environment:
      - MONGODB_URI=mongodb://mongo:27017
    ports:
      - "3000:3000"
```

Then run:

```bash
docker-compose up -d
```

### Using Docker directly

```bash
docker run -p 3000:3000 -e MONGODB_URI=mongodb://mongo:27017 ghcr.io/aientech/mongoman:main
```

## Local Installation

### Prerequisites

- Node.js
- Yarn or npm
- MongoDB instance (local or remote)

### Steps

1. Clone the repository:
```bash
git clone git@github.com:AienTech/mongoman.git
```

2. Navigate to project directory:
```bash
cd mongoman
```

3. Install dependencies:
```bash
yarn install
```

4. Set up environment variables:
```bash
cp .env.example .env.local
```

5. Edit `.env.local` and set your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017
```

6. Start the development server:
```bash
yarn dev
```

## Building from Source

To build the Docker image yourself:

```bash
docker build --build-arg MONGODB_URI=mongodb://temporary:27017 -t mongoman .
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017` |

## Verifying Installation

After installation:

1. Open your browser and navigate to `http://localhost:3000`
2. You should see the MongoMan interface
3. The dashboard will display your MongoDB connection status