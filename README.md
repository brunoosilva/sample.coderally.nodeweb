<<<<<<< HEAD
# sample.coderally.nodeweb
Node.js web app  for the Liberty-based Code Rally game - running this will let you play the game from a web browser.
=======
# CodeRally Web Application

## Clone repository

Navigate to a location on your local file system that you wish to clone coderally-web into and enter the following command in the terminal to clone the repository:

```bash
https://github.com/WASdev/sample.coderally.nodeweb.git
```

## Install the Node modules

If you would like to run this application locally follow the steps in this section. To deploy to Bluemix, you can skip this step and head over to the *Publishing to Bluemix* section.

Change into the directory that you have just cloned and install the Node modules required to run coderally-web:

```bash
cd coderally-web
npm install
```

After the Node modules have finished installing, you can run the application locally by typing:

```bash
node app.js
```

## Publishing to Bluemix

To publish the CodeRally Express application to IBM Bluemix, you must:

1. Create a Bluemix account if you don't already have one
2. Navigate to the Bluemix dashboard and create a **Cloud Foundry App**
3. Select Web
4. Select SDK for Node.js and continue
5. Give your application a meaningful name (this will be your URL) and hit finish
6. Once your application has finished staging, download and install the Cloud Foundry CLI
7. Change into the directory you cloned earlier and edit the `manifest.yml` file and set the `name` and `host` to the name of the Bluemix app you created in step 5
8. Follow the steps and Cloud Foundry commands provided on the Bluemix page to deploy the coderally-web application to your own Bluemix instance


And that's it, You're good to go!

# Credits

Ivy Ho, Sakib Hasan, Laven Sathiyanathan, Karan (S.) Randhawa, Kelvin Chan, Fady Abdel Malik
>>>>>>> 6f30ece... Initial commit
