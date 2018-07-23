import * as fs from 'async-file';

export class Positioner {

    public async LoadRecording(fileName: string) {
        let recordingJson = await fs.readFile(fileName)
        let recording = JSON.parse(recordingJson)
    }
}