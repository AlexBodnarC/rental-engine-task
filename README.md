# RentEngine Test task

## Folder structure

```javascript
src / // Source folder
  app / // Contains the main application code
  components / // Custom components
  hooks / // Custom hooks
  useDataWithStatus.ts; // Custom hook to combine data from rental-engine API and partners
useGetListingsInView.ts; // Custom hook to fetch rental-engine data
useGetPartnerData.ts; // Custom hook to fetch data from partners' APIs
_providers / // UI provider
  _types / // Contains TypeScript types
  api / // Contains endpoints to fetch data, handling CORS issues
  layout.tsx; // Layout of the app
loading.tsx; // Loading component
page.tsx; // Main page of the app
```

## How to run this app?

To run this app clone repo and install dependency with `npm install` and run command `npm run dev` also you need to setup .env file like in .env.example
