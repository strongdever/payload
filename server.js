const express = require('express');
const payload = require('payload');

const app = express();

payload.init({
  secret: 'SECRET_KEY',
  mongoURL: 'mongodb://localhost/payload',
  express: app,
})

app.listen(3000, async () => {
    console.log('Express is now listening for incoming connections on port 3000.')
});

const Orders = {
  // ...
  access: {
    create: () => true, // Everyone can create
    read: ({ req: { user } }) => {
      if (user) {
        return { // Users can only read their own
          owner: { equals: user.id, },
        };
      }

      return false; // Not logged in? Can't read any
    },
    update: ({ req: { user } }) => {
      // Only Admins can update Orders
      if (user.roles.includes('admin')) return true;
      return false;
    },
    delete: () => false, // No one can delete
  },
};

const Customers = {
  // ...
  hooks: {
    beforeChange: [
      // Before the Customer is created or updated,
      // sync it to Hubspot
      syncCustomerToHubspot,
    ],
    afterChange: [
      // Send the new Customer a welcome email
      // after it's successfully created
      sendWelcomeEmail,
    ],
    afterRead: [
      // Dynamically append user's active subscriptions
      // straight from Stripe
      addStripeSubscriptions,
    ],
  },
};