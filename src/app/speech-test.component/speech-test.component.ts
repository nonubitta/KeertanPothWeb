import { NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-speech-test',
  imports: [NgIf],
  templateUrl: './speech-test.component.html',
  styleUrl: './speech-test.component.scss'
})
export class SpeechTestComponent implements OnInit, OnDestroy {
  transcript: string = '';
  interimTranscript: string = '';
  isListening: boolean = false;
  @Output() transcriptChange = new EventEmitter<string>();
  @Output() recordingEnded = new EventEmitter<string>();
  private recognition: any;

  ngOnInit(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'pa-IN'; // Punjabi (India)
      this.recognition.continuous = true;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event: any) => {
        let finalText = '';
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalText += transcript + ' ';
          } else {
            interimText += transcript;
          }
        }
        this.transcript += finalText;
        this.interimTranscript = interimText;
        this.transcriptChange.emit(this.transcript);
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };

      this.recognition.onend = () => {
        this.isListening = false;
      };
    } else {
      alert('Your browser does not support Speech Recognition.');
    }
  }

  startListening(): void {
    if (this.recognition) {
      this.transcript = '';
      this.interimTranscript = '';
      this.isListening = true;
      this.recognition.start();
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
      this.recordingEnded.emit(this.transcript);
    }
  }

  ngOnDestroy(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
