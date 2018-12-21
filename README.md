# Redirect App

A node app that uses [greenlock](https://www.npmjs.com/package/greenlock-express) to respond to both secure and non secure requests. 

Domains, Paths and Destnations are stored in a Postgres database. By default if a domain exists in the database but does not have any redirects associated with it the request will be forwarded to www


## Getting Started
### Requirements

 1. A websever with a public IP **Greenlock will not work if you do not have this**
 2. SSH access to the web server
 3. Port 80 and 443 available on your websever
 4. A Postres database and the credntials for it

### Step 1.
SSH into the server and cd into the folder that you want the app to live in
### Step 2
clone down the git repo
### Step 3
cd into the redirect app folder 
>  cd redirect_app
### Step 4
Set up your .env file in the redirect_app dir 
**Below are all of the env vars**
>DATABASE_MAX_CONNECTIONS =
>DATABASE_MIN_CONNECTIONS = 
>DATABASE_AQUIRE =
>DATABASE_IDLE =
>DATABASE_EVICT =
>DATABASE_URL =
>DATABASE_SSL =
>GREENLOCK_SERVER =
>GREENLOCK_DIR =
>GREENLOCK_EMAIL =
>GREENLOCK_AGREETOS =
>GREENLOCK_COMMUNITYMEMBER =
>GREENLOCK_DEBUG =

### Step 5
install the node modules 
> npm install
### Step 6 
Install [PM2](https://pm2.io/doc/en/runtime/overview/) to run the app after the SSH session is closed
> npm install pm2 -g
> Follow these steps to create a [start up hook](https://pm2.io/doc/en/runtime/guide/startup-hook/#installation)

### Step 7
Start the app with PM2
> pm2 start server.js -redirectApp
## Troubleshooting

### Site is not redirecting

 - Make sure that the URL you are checking is correctly pointed to the URL or IP of the app
 - Make sure that the domain that is pointed at the server is in the domains table
    - The domain should not contain the protocol in or end in a "/"
 - Make sure that the domain_id is correct in the redirects table
    - The path should start with a "/"
 - Tail the logs 
	 - >pm2 logs redirectApp
   

