import { Injectable } from '@angular/core';
import { Note } from '../enums/Notes';

@Injectable({
  providedIn: 'root'
})
export class AudioService {

  audioContext!: AudioContext;
  pressedNotes = new Map();

  constructor() {
    this.audioContext = new (window.AudioContext)();
  }

  getFrequency(note: Note | string = Note.A, octave = 4) {
    const A4 = 440; // frequency value of a note A4
    let N = 0 // no of notes above the pitch of A4
    switch (note) {
      default:
      case "A":
        N = 0;
        break;
      case "A#":
      case "Bb":
        N = 1;
        break;
      case "B":
        N = 2;
        break;
      case "C":
        N = 3;
        break;
      case "C#":
      case "Db":
        N = 4;
        break;
      case "D":
        N = 5;
        break;
      case "D#":
      case "Eb":
        N = 6;
        break;
      case "E":
        N = 7;
        break;
      case "F":
        N = 8;
        break;
      case "F#":
      case "Gb":
        N = 9;
        break;
      case "G":
        N = 10;
        break;
      case "G#":
      case "Ab":
        N = 11;
        break;
    }
    N += 12 * (octave - 4);
    return A4 * Math.pow(2, N / 12);
  }

  stopKey(key: Note | string, octaveOffset: number) {
    if (!key) {
      return;
    }

    const osc = this.pressedNotes.get(key);
  
    if (osc) {
      setTimeout(() => {
        osc.stop();
      }, 2000);
  
      this.pressedNotes.delete(key);
    }
  };

  playKey(key: Note | string, octaveOffset: number) {
    if (!key) {
      return;
    }
  
    const osc = this.audioContext.createOscillator();
    const noteGainNode = this.audioContext.createGain();
    noteGainNode.connect(this.audioContext.destination);
  
    // volume controls (gain)
    const zeroGain = 0.00001;
    const maxGain = 0.5;
    const sustainedGain = 0.001;
  
    noteGainNode.gain.value = zeroGain;
  
    const setAttack = () =>
      noteGainNode.gain.exponentialRampToValueAtTime(
        maxGain,
        this.audioContext.currentTime + 0.01
      );
    const setDecay = () =>
      noteGainNode.gain.exponentialRampToValueAtTime(
        sustainedGain,
        this.audioContext.currentTime + 1
      );
    const setRelease = () =>
      noteGainNode.gain.exponentialRampToValueAtTime(
        zeroGain,
        this.audioContext.currentTime + 2
      );
  
    setAttack();
    setDecay();
    setRelease();
  
    osc.connect(noteGainNode);
    osc.type = "triangle"; // waveform type (used to determine the timbre of the sound)
  
    const freq = this.getFrequency(key, (octaveOffset || - 1));
  
    if (Number.isFinite(freq)) {
      osc.frequency.value = freq;
    }
  
    this.pressedNotes.set(key, osc);
    this.pressedNotes.get(key).start();
  };
}
