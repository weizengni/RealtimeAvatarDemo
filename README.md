# Realtime Avatar Streaming Demo

## Pre-Requisites

- Apply for becoming a real-time avatar whitelist user
- Node.js and npm installed on your system.
- API key for HeyGen's API.

## Run the Demo

1. Clone the repository.

   ```
   git clone git@github.com:surreal-ai/RealtimeAvatarDemo.git
   ```

2. Open the `api.json` file and replace `'YourApiKey'` with your API key:

   ```
   "apiKey": "YourApiKey";
   ```

3. open a terminal in the folder and then install the express and run the server.js:

   ```
   npm install express
   node server.js
   ```

4. you will see `App is listening on port 3000!`.

## Use the Demo

1. Open the web browser and enter the `http://localhost:3000`to start the demo.
2. Click the "New" button to create a new session. The status updates will be displayed on the screen.
3. After the session is created successfully, click the "Start" button to start streaming the avatar.
4. To send a task to the avatar, type the text in the provided input field and click the "Repeat Text" button.
5. Once done, click the "Close Connection" button to close the session.

Remember, this is a demo and should be modified according to your needs and preferences. Happy coding!

## Troubleshooting

In case you face any issues while running the demo or have any questions, feel free to raise an issue in this repository or contact our support team.

Please note, if you encounter a "Server Error", it could be due to the server being offline. In such cases, please contact the service provider.
