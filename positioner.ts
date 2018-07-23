import * as fs from 'async-file';
import * as path from 'path'

export class Positioner {

    public async LoadRecording(fileName: string) {
        let filepath = path.join(process.cwd(), `./data/${fileName}`)

       // let path = process.cwd() + "data\\" + fileName
        let recordingJson = await fs.readFile(filepath)
        let recording = JSON.parse(recordingJson)
    }

    public async Run() {
        let recording = await this.LoadRecording("Route1Expert.json")
    }
}