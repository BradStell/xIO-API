

# xIO API



## Usage
To have a third party access xIO's internal repository API calls, with little or no abstraction as to what is happening behind the scenes.



## Developing
Initial Test Version 0.0.1
By: Brad Stell
Release Date: 12/26/2014


### npm modules
If not already on your machine.."\n"
npm install oauth-request<br>
npm install octonode"<br>"
npm install request'\n'
npm install http

### Running API
1) Open your terminal and get in the directory that you saved the project into.
2) run the command 'node index.js'
3) Open your favorite browser and head to http://localhost:8888/api 
4) This end point has a table containing information about the API's functionality.

### Notes
This module was not built with eclipse, rather I built it from scratch with just nodejs.  It currently has no database functionality. I understand this will be the end goal. However, since we do not have our own densely populated database, I have routed the xIO API directly to its corresponding repository API call.

Also, This API currently only works with a local setup.  If this is what you are looking for, I will start to implement a cloud functionality into the scaffolding. 

