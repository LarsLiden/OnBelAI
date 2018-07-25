export class TTYAgent {
    public speak(lines: string[]): void {
        const msg = new SpeechSynthesisUtterance();
        lines.forEach(line => {
            setTimeout(() => {
                msg.text = line;
                speechSynthesis.speak(msg);
            }, 1000);
        });
    }
}