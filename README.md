# Custom checkout flow quickstart

Build a checkout form with Orders and Elements to automatically calculate sales tax, VAT, and GST and complete a payment using various payment methods. Included are some basic build and run scripts you can use to start up the application.

## Running the sample

1. Build the application

```
npm install
npx playwright install
```

2. Add .env

Copy `.env.local.example` to `.env.local` and add your stripe testing key.

3. Run the application

```
npm run dev
```

4. Go to [http://localhost:3000](http://localhost:3000)

5. Run tests on the dev server

```
npm run test
```
