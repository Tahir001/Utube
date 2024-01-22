// Import statements
import express from "express";
import ffmpeg from "fluent-ffmpeg";

// Initialize it by creating a instance of it 
const app = express();
const port = 3000; 

import express from 'express';
import ffmpeg from 'fluent-ffmpeg';

const app = express();
app.use(express.json());

app.post('/process-video', (req, res) => {

  // Get the path of the input video file from the request body
  const inputFilePath = req.body.inputFilePath;
  const outputFilePath = req.body.outputFilePath;

  // Check if the input file path is defined
  if (!inputFilePath || !outputFilePath) {
    return res.status(400).send('Bad Request: Missing file path');
  }

  // Create the ffmpeg command
  ffmpeg(inputFilePath)
    //Convert the input file path to 360p
    .outputOptions('-vf', 'scale=-1:360') // 360p
    // Once it's done, log and result status as completed 
    .on('end', function() {
        console.log('Processing finished successfully');
        res.status(200).send('Processing finished successfully');
    })
    // if there was an error, print that out 
    .on('error', function(err: any) {
        console.log('An error occurred: ' + err.message);
        res.status(500).send('An error occurred: ' + err.message);
    })
    // the the output to the output file path
    .save(outputFilePath);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

/*
// Archieved. 
// Simple route with app.get, where we have a request and a response 
// This is a http get endpoint 
app.get("/", (req, res) =>{ 
    // Logic for that route, will be excecuted everytime that endpoint is called 
    res.send("Hello World")


// Start our server by listening on this port, then do some logging 
app.listen(port, () => {
    console.log(
        `Video processing service listening at https://localhost:${port}`
    );
});
});
*/ 