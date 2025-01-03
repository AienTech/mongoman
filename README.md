# MongoMan

A modern, web-based MongoDB admin interface built with Next.js, shadcn/ui, and Tailwind CSS. MongoMan provides an intuitive way to manage your MongoDB databases, collections, and documents with a clean and responsive UI.

## Features

- 🎨 Modern UI
- 📊 Database statistics and monitoring
- 📝 Collection management
- 📄 Document management

## Environment Variables

To run this project, you will need to add the following environment variable:

`MONGODB_URI` - Your MongoDB connection string (e.g., mongodb://localhost:27017)

## Run Locally

Clone the project

```bash
git clone git@github.com:AienTech/mongoman.git
```

Go to the project directory

```bash
cd mongoman
```

Install dependencies

```bash
yarn install
```

Set up your environment variables

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your MongoDB connection string.

Start the development server

```bash
yarn dev
```

## Docker Installation

Run with docker-compose:

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

Or run directly with Docker:

```bash
docker run -p 3000:3000 -e MONGODB_URI=mongodb://mongo:27017 ghcr.io/aientech/mongoman:main
```

## Building from Source

Build the Docker image:

```bash
docker build --build-arg MONGODB_URI=mongodb://temporary:27017 -t mongoman .
```

## Tech Stack

- Next.js 15
- React
- TypeScript
- shadcn/ui
- Tailwind CSS
- TanStack Table
- MongoDB Node.js Driver

## Contributing

Contributions are always welcome! Here's how you can help:

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgements

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Next.js](https://nextjs.org/) for the amazing framework
- [MongoDB](https://www.mongodb.com/) for the database platform

## Authors

- [@aientech](https://github.com/aientech)

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Roadmap

- Add authentication and authorization
- Support for MongoDB Atlas integration
- Advanced query builder
- Database backup and restore functionality
- Collection and document import/export
- Aggregation pipeline builder
- Light/dark mode support

## Screenshots

Coming soon...

## Related

Here are some related projects:

- [Mongo Express](https://github.com/mongo-express/mongo-express)
- [MongoDB Compass](https://www.mongodb.com/products/compass)