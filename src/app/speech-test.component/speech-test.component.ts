import { NgIf } from '@angular/common';
import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-speech-test',
  imports: [],
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

  constructor(private ngZone: NgZone) {}

  ngOnInit(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = 'pa-IN'; // Punjabi (India)
      this.recognition.continuous = true;
      this.recognition.interimResults = false; // ❌ disable interim

      this.recognition.onresult = (event: any) => {
        let finalText = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript + ' ';
          }
        }
        this.transcript += finalText;

        this.ngZone.run(() => {
          this.transcriptChange.emit(this.transcript);
        });
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        alert('Google speech service is not available right now. Please try again later.');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        // ✅ emit transcript only when recording fully ends
        this.recordingEnded.emit(this.transcript);
      };
    } else {
      alert('Your browser does not support Speech Recognition.');
    }
  }

  startListening(): void {
    if (this.recognition) {
      this.transcript = '';
      this.isListening = true;
      this.recognition.start();
    }
  }

  stopListening(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.isListening = false;
    }
  }


  ngOnDestroy(): void {
    if (this.recognition) {
      this.recognition.stop();
    }
  }
}
