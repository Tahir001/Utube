/*
This file will contain all of the code that interacts with either Google Cloud Storage, or our local file system.
*/ 

import { Storage} from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage new Storage();

//Google cloud bucket name -- Has to be globally unique
const rawVideoBucketName = "utube-raw-videos-007";
const processedVideoBucketName = "utube-processed-videos-007";

// Setting up local paths aswell 
const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/*
* Creates the local directories for raw and processed videos 
*/
export function setupDirectories() {
    ensureDirectoryExistence(localRawVideoPath);
    ensureDirectoryExistence(localProcessedVideoPath);
  }
  

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    // Function to convert a given video 
    // Promise -> Allows us to either resolve or reject this function at runtime 
    // Void
    return new Promise<void>((resolve, reject) => {
      ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360") // Convert the video to 360p 
        .on("end", function () {
          console.log("Processing finished successfully");
          // Once it's been converted successfully, we can say that it has resolved 
          resolve();
        })
        // If there was an error, we want to let the world know there was an error. 
        .on("error", function (err: any) {
          console.log("An error occurred: " + err.message);
          reject(err);
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}
  

/**
 * @param fileName - The name of the file to download from the 
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
// Async function has to return promise 
export async function downloadRawVideo(fileName: string) {
    // Download the raw video from the storage bucket
    await storage.bucket(rawVideoBucketName) // Wait till the storage.bucket gets the bucket 
      .file(fileName) // What file to download 
      .download({ // Where to download it 
        destination: `${localRawVideoPath}/${fileName}`,
      });
    
    // Print out the google storage bucket name, file name, and where we dumped it to locally 
    console.log(
      `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}.`
    );
  }


/**
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
// Similar as the function above for downloading video, except now uploading it 
export async function uploadProcessedVideo(fileName: string) {

    const bucket = storage.bucket(processedVideoBucketName);
  
    // Upload video to the bucket
    await storage.bucket(processedVideoBucketName)
      .upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName,
      });
    console.log(
      `${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}.`
    );
  
    // Set the video to be publicly readable
    await bucket.file(fileName).makePublic();
  }
  
/**
 * @param fileName - The name of the file to delete from the
 * {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been deleted.
 * 
 */
export function deleteRawVideo(fileName: string) {
  return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
* @param fileName - The name of the file to delete from the
* {@link localProcessedVideoPath} folder.
* @returns A promise that resolves when the file has been deleted.
* 
*/
export function deleteProcessedVideo(fileName: string) {
  return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}


/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Failed to delete file at ${filePath}`, err);
            reject(err);
          } else {
            console.log(`File deleted at ${filePath}`);
            resolve();
          }
        });
      } else {
        console.log(`File not found at ${filePath}, skipping delete.`);
        resolve();
      }
    });
  }
  

/**
 * Ensures a directory exists, creating it if necessary.
 * @param {string} dirPath - The directory path to check.
 */
function ensureDirectoryExistence(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables creating nested directories
      console.log(`Directory created at ${dirPath}`);
    }
  }
  