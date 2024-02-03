import { Storage} from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage new Storage();

const rawVideoBucketName = "utube-raw-videos";
const processedVideoBucketName = "utube-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/*
* Creates the local directories for raw and processed videos 
*/
export function setupDirectories() {


}
